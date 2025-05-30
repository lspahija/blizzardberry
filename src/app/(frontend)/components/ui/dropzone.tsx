import * as React from 'react';
import { cn } from '@/app/(frontend)/lib/cssClassNames';
import { Upload, X, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/app/(frontend)/components/ui/card';
import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import type { PDFDocumentProxy } from 'pdfjs-dist';

// Define types
type TesseractWorker = Awaited<ReturnType<typeof createWorker>>;

// Constants
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const INITIAL_PROCESSING_STATE = { progress: 0, currentPage: 0, totalPages: 0 };

// File type definitions
const FILE_TYPES = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain'
} as const;

// Retry helper function
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch {
      if (i === retries - 1) throw new Error('Failed after retries');
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('Unreachable');
}

// Custom hooks
function useTesseractWorker() {
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const workerRef = React.useRef<TesseractWorker | null>(null);

  const initialize = React.useCallback(async () => {
    try {
      if (!workerRef.current) {
        workerRef.current = await withRetry(async () => {
          const worker = await createWorker();
          await worker.load();
          await worker.reinitialize('eng');
          return worker;
        });
      }
      return workerRef.current;
    } catch (error) {
      console.error('Failed to initialize Tesseract worker:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize OCR');
      throw error;
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const terminate = React.useCallback(async () => {
    if (workerRef.current) {
      try {
        await workerRef.current.terminate();
        workerRef.current = null;
      } catch (error) {
        console.error('Error terminating Tesseract worker:', error);
        throw error;
      }
    }
  }, []);

  React.useEffect(() => {
    initialize();
    return () => {
      terminate();
    };
  }, [initialize, terminate]);

  return { workerRef, isInitializing, error, initialize, terminate };
}

// Helper functions
function validateFile(file: File): string | null {
  const valid = Object.entries(FILE_TYPES).some(
    ([ext, mime]) =>
      file.name.toLowerCase().endsWith(`.${ext}`) && file.type === mime
  );
  if (!valid) return 'Unsupported file type. Please upload a .pdf, .docx, or .txt file';
  if (file.size > MAX_FILE_SIZE) return `File size must be less than ${MAX_FILE_SIZE_MB}MB`;
  return null;
}

async function ocrPdfPages(
  pdf: PDFDocumentProxy,
  worker: TesseractWorker,
  setProgress: (state: typeof INITIAL_PROCESSING_STATE | ((prev: typeof INITIAL_PROCESSING_STATE) => typeof INITIAL_PROCESSING_STATE)) => void
): Promise<string> {
  let fullText = '';
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    throw new Error('Failed to create canvas context');
  }

  for (let i = 1; i <= pdf.numPages; i++) {
    try {
      setProgress({ ...INITIAL_PROCESSING_STATE, currentPage: i, totalPages: pdf.numPages });
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      const result = await worker.recognize(canvas.toDataURL('image/png'));
      fullText += result.data.text + '\n';
      setProgress(prev => ({ 
        ...prev, 
        progress: (i / pdf.numPages) * 100 
      }));
    } catch (error) {
      console.warn(`Failed to process page ${i}:`, error);
      if (!worker) break; // Break if worker was terminated
      continue;
    }
  }

  return fullText;
}

interface DropzoneProps {
  onFileDrop: (text: string) => void;
  className?: string;
}

function DropzoneComponent({ onFileDrop, className }: DropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [canCancel, setCanCancel] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const lastFileRef = React.useRef<string | null>(null);
  const [processingState, setProcessingState] = React.useState(INITIAL_PROCESSING_STATE);
  const [pdfjs, setPdfjs] = React.useState<any>(null);

  const { workerRef, isInitializing: isTesseractInitializing, error: tesseractError } = useTesseractWorker();

  const isInitializing = isTesseractInitializing;

  // Initialize PDF.js on client side
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      import('pdfjs-dist').then((module) => {
        const { getDocument, GlobalWorkerOptions } = module;
        // Use the worker directly from the package
        GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.min.mjs');
        setPdfjs({ getDocument });
      });
    }
  }, []);

  // Auto-dismiss messages after 5 seconds
  React.useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        if (error) setError(null);
        if (successMessage) setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // Handle initialization errors
  React.useEffect(() => {
    if (tesseractError) setError(tesseractError);
  }, [tesseractError]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processPdf = async (file: File): Promise<string> => {
    if (!workerRef.current) {
      throw new Error('OCR is not initialized. Please refresh the page.');
    }

    if (!pdfjs) {
      throw new Error('PDF processing is not initialized. Please refresh the page.');
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      let hasText = false;

      // First try to extract text normally
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str ?? '')
          .join(' ');
        
        if (pageText.trim()) {
          hasText = true;
          fullText += pageText + '\n';
        }
      }

      // If no text was found, use OCR
      if (!hasText) {
        setProcessingState({ ...INITIAL_PROCESSING_STATE, totalPages: pdf.numPages });
        setCanCancel(true);
        fullText = await ocrPdfPages(pdf, workerRef.current, setProcessingState);
      }

      return fullText;
    } catch (error) {
      console.error('PDF processing error:', error);
      if (error instanceof Error && error.message.includes('Invalid PDF')) {
        throw new Error(`Invalid PDF file "${file.name}". Please make sure the file is not corrupted.`);
      }
      throw new Error(`Error processing PDF file "${file.name}". Please try again.`);
    } finally {
      setCanCancel(false);
      setProcessingState(INITIAL_PROCESSING_STATE);
    }
  };

  const handleCancel = async () => {
    if (workerRef.current) {
      try {
        await workerRef.current.terminate();
        await workerRef.current.reinitialize('eng');
      } catch (error) {
        console.error('Error during worker cleanup:', error);
        setError('Failed to reset OCR. Please refresh the page.');
      }
    }

    setIsProcessing(false);
    setProcessingState(INITIAL_PROCESSING_STATE);
    setCanCancel(false);
    setError('Processing cancelled');
  };

  const processFile = async (file: File): Promise<string> => {
    const validationError = validateFile(file);
    if (validationError) throw new Error(validationError);

    try {
      switch (file.type) {
        case 'text/plain':
          return await file.text();
        case 'application/pdf':
          return await processPdf(file);
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          return result.value;
        }
        default:
          throw new Error(`Unsupported file type for "${file.name}"`);
      }
    } catch (error) {
      console.error('File processing error:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  };

  const handleFileSelect = async (file: File) => {
    if (isInitializing) {
      setError('Please wait while document processing is initializing...');
      return;
    }

    // Check for duplicate file
    const fileIdentifier = `${file.name}${file.size}${file.lastModified}`;
    if (lastFileRef.current === fileIdentifier) {
      setError('This file has already been processed.');
      return;
    }

    lastFileRef.current = fileIdentifier;
    setError(null);
    setSuccessMessage(null);
    setIsProcessing(true);
    setProcessingState(INITIAL_PROCESSING_STATE);

    try {
      const text = await processFile(file);
      onFileDrop(text);
      setSuccessMessage('File processed successfully');
    } catch (err: any) {
      setError(err.message || 'Error processing file');
      // Clear the last file reference on error to allow retry
      lastFileRef.current = null;
    } finally {
      setIsProcessing(false);
      setProcessingState(INITIAL_PROCESSING_STATE);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    await handleFileSelect(file);
  };

  const handleClick = () => {
    if (isInitializing) {
      setError('Please wait while document processing is initializing...');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,.docx,.txt"
        className="hidden"
      />
      <Card
        role="button"
        tabIndex={0}
        aria-disabled={isProcessing || isInitializing}
        aria-busy={isProcessing}
        className={cn(
          'relative border-2 border-dashed transition-colors cursor-pointer',
          isDragging ? 'border-[#FE4A60] bg-[#FFF4DA]' : 'border-gray-900',
          (isProcessing || isInitializing) && 'opacity-50',
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center gap-2">
            {isInitializing ? (
              <Loader2 className="h-8 w-8 text-gray-900 animate-spin" />
            ) : (
              <Upload className={cn("h-8 w-8 text-gray-900", isProcessing && "animate-pulse")} />
            )}
            <div className="text-sm text-gray-900">
              <p className="font-medium">
                {isInitializing ? 'Initializing document processing...' :
                 isProcessing ? 'Processing file...' : 
                 'Drag and drop your file here'}
              </p>
              <p className="text-gray-600">or click to browse</p>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: .pdf, .docx, .txt (max {MAX_FILE_SIZE_MB}MB)
              </p>
            </div>
            {isProcessing && (
              <div className="w-full max-w-xs mt-2">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-[#FE4A60] rounded-full transition-all duration-300"
                    style={{ width: `${processingState.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-600">
                    {processingState.currentPage > 0 && processingState.totalPages > 0 
                      ? `Processing page ${processingState.currentPage} of ${processingState.totalPages}`
                      : 'Processing...'}
                  </p>
                  {canCancel && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel();
                      }}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 relative z-10"
                    >
                      <X className="h-3 w-3" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-red-600 mt-2"
                >
                  {error}
                </motion.p>
              )}
              {successMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-green-600 mt-2"
                >
                  {successMessage}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Export a client-side only version of the component
export const Dropzone = dynamic(() => Promise.resolve(DropzoneComponent), {
  ssr: false
});