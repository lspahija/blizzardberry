'use client';

import { useState, useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';

// Cache ImageMagick initialization
let magickInitPromise: Promise<{
  ImageMagick: any;
  MagickFormat: any;
  ColorSpace: any;
  EvaluateOperator: any;
  Channels: any;
}> | null = null;

// Cache profile data
let profileBytes: Uint8Array | null = null;

async function initializeMagick() {
  if (magickInitPromise) {
    return magickInitPromise;
  }

  magickInitPromise = (async () => {
    // Dynamic import for @imagemagick/magick-wasm
    const {
      initializeImageMagick,
      ImageMagick,
      MagickFormat,
      ColorSpace,
      EvaluateOperator,
      Channels,
    } = await import('@imagemagick/magick-wasm');

    // Get WASM bytes from public folder
    const wasmResponse = await fetch('/magick.wasm');
    const wasmBytes = new Uint8Array(await wasmResponse.arrayBuffer());

    // Initialize ImageMagick with WASM bytes
    await initializeImageMagick(wasmBytes);

    // Load and cache ICC profile - essential for HDR
    if (!profileBytes) {
      const profileResponse = await fetch('/profiles/2020_profile.icc');
      profileBytes = new Uint8Array(await profileResponse.arrayBuffer());
    }

    return {
      ImageMagick,
      MagickFormat,
      ColorSpace,
      EvaluateOperator,
      Channels,
    };
  })();

  return magickInitPromise;
}

export default function HDRConverterPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hdrImageUrl, setHdrImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setHdrImageUrl(null);

      // Automatically convert to HDR
      await convertToHDR(file);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        await handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const convertToHDR = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Use cached initialization (only slow on first use)
      setProgress(20);
      const {
        ImageMagick,
        MagickFormat,
        ColorSpace,
        EvaluateOperator,
        Channels,
      } = await initializeMagick();

      setProgress(60);

      // Get image file as buffer
      const arrayBuffer = await file.arrayBuffer();
      const inputBuffer = new Uint8Array(arrayBuffer);

      setProgress(80);

      // Complete HDR processing - only skip ICC profile (slowest operation)
      let resultBuffer: Uint8Array = new Uint8Array();

      ImageMagick.read(inputBuffer, (img) => {
        // Equivalent to: -colorspace RGB
        img.colorSpace = ColorSpace.RGB;

        // Equivalent to: -evaluate Multiply 1.5
        img.evaluate(Channels.All, EvaluateOperator.Multiply, 1.5);

        // Equivalent to: -evaluate Pow 0.9
        img.evaluate(Channels.All, EvaluateOperator.Pow, 0.9);

        // Equivalent to: -colorspace sRGB
        img.colorSpace = ColorSpace.sRGB;

        // Equivalent to: -depth 16
        img.depth = 16;

        // Equivalent to: -profile 2020_profile.icc (essential for HDR)
        img.setProfile({ name: 'icc', data: profileBytes! });

        // Output as PNG for quality
        img.write(MagickFormat.Png, (data) => {
          resultBuffer = data;
        });
      });

      // Create blob and URL for download/display
      const blob = new Blob([resultBuffer], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      setHdrImageUrl(url);
      setProgress(100);
    } catch (error) {
      console.error('Error converting image:', error);
      alert('Failed to convert image to HDR');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadHDRImage = () => {
    if (hdrImageUrl) {
      const a = document.createElement('a');
      a.href = hdrImageUrl;
      a.download = `${selectedFile?.name?.replace(/\.[^/.]+$/, '') || 'image'}_hdr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">HDR Image Converter</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Drop an image and get an ultra-bright HDR version instantly for Mac
          displays
        </p>
      </div>

      <div className="grid gap-6">
        {/* File Upload Area */}
        <Card className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="mb-4">
              <svg
                className="w-12 h-12 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-lg mb-2">
              Drop your image here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports JPG, PNG, WEBP, and other common image formats
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
            >
              Choose File
            </label>
          </div>
        </Card>

        {/* Processing Status */}
        {isProcessing && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Converting to HDR...</h3>
            <Progress value={progress} className="w-full mb-2" />
            <p className="text-sm text-center">
              Processing your image for ultra-bright display
            </p>
          </Card>
        )}

        {/* Preview Section */}
        {previewUrl && !isProcessing && !hdrImageUrl && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Original Image</h3>
            <div className="mb-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                style={{ maxHeight: '400px' }}
              />
            </div>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Converting to HDR automatically...
            </p>
          </Card>
        )}

        {/* HDR Result Section */}
        {hdrImageUrl && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              ✨ HDR Conversion Complete!
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Original */}
              <div>
                <h4 className="text-md font-medium mb-2">Original</h4>
                <img
                  src={previewUrl}
                  alt="Original"
                  className="w-full h-auto rounded-lg shadow-md"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
              </div>

              {/* HDR Result */}
              <div>
                <h4 className="text-md font-medium mb-2">HDR Enhanced</h4>
                <img
                  src={hdrImageUrl}
                  alt="HDR Enhanced"
                  className="w-full h-auto rounded-lg shadow-md"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
              </div>
            </div>

            <div className="text-center">
              <Button onClick={downloadHDRImage} size="lg" className="mb-3">
                Download HDR Image
              </Button>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your HDR image will display ultra-bright on Mac HDR displays!
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
