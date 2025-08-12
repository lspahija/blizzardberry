'use client';

import { useState, use } from 'react';
import { Button } from '@/app/(frontend)/components/ui/button';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/app/(frontend)/components/ui/card';
import {
  Loader2,
  ArrowLeft,
  PlusCircle,
  Trash2,
  FileText,
  Info,
} from 'lucide-react';
import { Input } from '@/app/(frontend)/components/ui/input';
import { Label } from '@/app/(frontend)/components/ui/label';
import { Textarea } from '@/app/(frontend)/components/ui/textarea';
import { Dropzone } from '@/app/(frontend)/components/ui/dropzone';
import { useDocuments } from '@/app/(frontend)/hooks/useDocuments';
import Link from 'next/link';
import SuccessOverlay from '@/app/(frontend)/components/ui/success-overlay';
import posthog from 'posthog-js';

interface MetadataField {
  key: string;
  value: string;
}

export default function AddDocument({
  params: paramsPromise,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const params = use(paramsPromise);
  const [text, setText] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([]);
  const { handleCreateDocument, isSubmitting, error, success } = useDocuments();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const addMetadataField = () => {
    if (isSubmitting) return;
    setMetadataFields([...metadataFields, { key: '', value: '' }]);
  };

  const removeMetadataField = (index: number) => {
    if (isSubmitting) return;
    setMetadataFields(metadataFields.filter((_, i) => i !== index));
  };

  const updateMetadataField = (
    index: number,
    field: keyof MetadataField,
    value: string
  ) => {
    if (isSubmitting) return;
    const updatedFields = [...metadataFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setMetadataFields(updatedFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const combinedText = fileContent || text;
    
    posthog.capture('document_creation_started', {
      agent_id: params.agentId,
      has_file_content: !!fileContent,
      has_text: !!text,
      content_length: combinedText.length,
      metadata_fields_count: metadataFields.length
    });

    const result = await handleCreateDocument(combinedText, metadataFields);
    
    if (result) {
      posthog.capture('document_creation_success', {
        agent_id: params.agentId,
        content_length: combinedText.length,
        metadata_fields_count: metadataFields.length
      });
    } else if (error) {
      posthog.capture('document_creation_failed', {
        agent_id: params.agentId,
        error: error
      });
    }
  };

  const handleFileDrop = (fileText: string) => {
    if (isSubmitting) return;
    
    posthog.capture('document_file_uploaded', {
      agent_id: params.agentId,
      file_size: fileText.length
    });
    
    setFileContent(fileText);
  };

  if (success) {
    return (
      <SuccessOverlay
        title="Document Added Successfully!"
        message="Your document has been added and is ready to use."
        icon={
          <svg
            className="h-6 w-6 text-brand"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        }
      />
    );
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-background p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground">
            Add New Document
          </h1>
          <Button
            asChild
            className="bg-secondary text-secondary-foreground border-[3px] border-border hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-200 shadow-md text-lg font-semibold px-6 py-2 rounded-lg hover:bg-secondary/90"
            disabled={isSubmitting}
          >
            <Link
              href={`/agents/${params.agentId}`}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Agent
            </Link>
          </Button>
        </div>

        {/* Info/tip box */}
        <div className="mb-12 flex items-center bg-muted border-l-4 border-accent p-4 rounded-lg shadow-md">
          <Info className="h-6 w-6 text-accent mr-3" />
          <span className="text-foreground text-base">
            Upload or paste your document content below. You can also add
            optional metadata to provide more context for your agent.
          </span>
        </div>

        <Card className="border-[3px] border-border bg-card mb-12 rounded-lg shadow-xl border-l-8 border-l-brand relative">
          {isSubmitting && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-foreground font-semibold">
                  Adding Document...
                </p>
                <p className="text-muted-foreground text-sm">
                  Please wait while we process your document
                </p>
              </div>
            </div>
          )}
          <CardHeader className="flex items-center space-x-2">
            <FileText className="h-7 w-7 text-brand" />
            <CardTitle className="text-2xl font-semibold text-foreground">
              Document Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <Label
                  htmlFor="text"
                  className=" text-foreground flex items-center gap-2 text-lg font-semibold"
                >
                  Document Content
                </Label>
                <p className="text-sm text-muted-foreground mt-1 ml-6">
                  Upload a file or enter the text content of the document which
                  will be given to your agent.
                </p>
                <div className="mt-4 space-y-4">
                  <Dropzone
                    onFileDrop={handleFileDrop}
                    className="w-full"
                    disabled={isSubmitting}
                  />
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-background px-2 text-foreground">
                        or
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <Textarea
                      id="text"
                      value={fileContent ? '' : text}
                      onChange={(e) => setText(e.target.value)}
                      required={!fileContent}
                      className={`mt-2 block w-full rounded-md border-[2px] shadow-sm text-base p-2 transition-all duration-200 ${
                        fileContent 
                          ? 'border-muted bg-muted/50 text-muted-foreground cursor-not-allowed opacity-60' 
                          : 'border-border focus:border-brand focus:ring-brand'
                      }`}
                      rows={10}
                      placeholder={fileContent ? 'Document content loaded from file' : 'Enter the document text here...'}
                      disabled={isSubmitting || !!fileContent}
                    />
                    {fileContent && (
                      <div className="absolute inset-0 bg-muted/20 rounded-md flex items-center justify-center pointer-events-none">
                        <div className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-border shadow-lg">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">File uploaded - text input disabled</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Label className="block text-foreground flex items-center gap-2 text-lg font-semibold">
                  <PlusCircle className="h-4 w-4 text-brand" />
                  Metadata (Optional)
                </Label>
                <p className="text-sm text-muted-foreground mt-1 ml-6">
                  Add key-value pairs to provide additional context for the
                  document.
                </p>
                {metadataFields.map((field, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-[1fr_1fr_50px] gap-4 mt-4 items-end"
                  >
                    <div>
                      <Label htmlFor={`metadataKey${index}`}>Key</Label>
                      <Input
                        id={`metadataKey${index}`}
                        value={field.key}
                        onChange={(e) =>
                          updateMetadataField(index, 'key', e.target.value)
                        }
                        placeholder="category"
                        className="mt-2 border-[2px] border-border"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`metadataValue${index}`}>Value</Label>
                      <Input
                        id={`metadataValue${index}`}
                        value={field.value}
                        onChange={(e) =>
                          updateMetadataField(index, 'value', e.target.value)
                        }
                        placeholder="product_info"
                        className="mt-2 border-[2px] border-border"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Button
                        variant="destructive"
                        className="border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer rounded-xl p-2 md:p-3 mb-0.2"
                        onClick={() => removeMetadataField(index)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 bg-card text-foreground border border-border hover:bg-muted hover:border-border transition-transform duration-200 text-base font-normal px-4 py-2 flex items-center gap-2"
                  onClick={addMetadataField}
                  disabled={isSubmitting}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Metadata Field
                </Button>
              </div>
              {error && <p className="text-destructive">{error}</p>}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand text-primary-foreground border-[3px] border-border hover:-translate-y-1 hover:-translate-x-1 hover:bg-brand/80 transition-transform duration-200 shadow-md text-lg font-semibold w-full"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding Document...
                  </>
                ) : (
                  'Add Document'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
