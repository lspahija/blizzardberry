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
    setMetadataFields([...metadataFields, { key: '', value: '' }]);
  };

  const removeMetadataField = (index: number) => {
    setMetadataFields(metadataFields.filter((_, i) => i !== index));
  };

  const updateMetadataField = (
    index: number,
    field: keyof MetadataField,
    value: string
  ) => {
    const updatedFields = [...metadataFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setMetadataFields(updatedFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCreateDocument(text, metadataFields);
  };

  const handleFileDrop = (fileText: string) => {
    setText(fileText);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-[#FFFDF8] p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-gray-900">
            Add New Document
          </h1>
          <Button
            asChild
            className="bg-[#FE4A60] text-white border-[3px] border-gray-900 hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-200 shadow-md text-lg font-semibold px-6 py-2 rounded-lg"
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
        <div className="mb-12 flex items-center bg-[#FFF4DA] border-l-4 border-[#FE4A60] p-4 rounded-lg shadow-md">
          <Info className="h-6 w-6 text-[#FE4A60] mr-3" />
          <span className="text-gray-800 text-base">
            Upload or paste your document content below. You can also add
            optional metadata to provide more context for your agent.
          </span>
        </div>

        <Card className="border-[3px] border-gray-900 bg-[#FFFDF8] mb-12 rounded-lg shadow-xl border-l-8 border-l-[#FE4A60]">
          <CardHeader className="flex items-center space-x-2">
            <FileText className="h-7 w-7 text-[#FE4A60]" />
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Document Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <Label
                  htmlFor="text"
                  className="block text-gray-900 flex items-center gap-2 text-lg font-semibold"
                >
                  <FileText className="h-4 w-4 text-[#FE4A60]" />
                  Document Content
                </Label>
                <p className="text-sm text-gray-600 mt-1 ml-6">
                  Upload a file or enter the text content of the document which
                  will be given to your agent.
                </p>
                <div className="mt-4 space-y-4">
                  <Dropzone onFileDrop={handleFileDrop} className="w-full" />
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-900"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-[#FFFDF8] px-2 text-gray-900">
                        or
                      </span>
                    </div>
                  </div>
                  <Textarea
                    id="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                    className="mt-2 block w-full rounded-md border-gray-900 border-[2px] shadow-sm focus:border-[#FE4A60] focus:ring-[#FE4A60] text-base p-2"
                    rows={10}
                    placeholder="Enter the document text here..."
                  />
                </div>
              </div>
              <div>
                <Label className="block text-gray-900 flex items-center gap-2 text-lg font-semibold">
                  <PlusCircle className="h-4 w-4 text-[#FE4A60]" />
                  Metadata (Optional)
                </Label>
                <p className="text-sm text-gray-600 mt-1 ml-6">
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
                        className="mt-2 border-[2px] border-gray-900"
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
                        className="mt-2 border-[2px] border-gray-900"
                      />
                    </div>
                    <div>
                      <Button
                        variant="outline"
                        className="bg-[#FFFDF8] text-gray-900 border-[2px] border-gray-900 hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-200"
                        onClick={() => removeMetadataField(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 bg-white text-gray-900 border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-transform duration-200 text-base font-normal px-4 py-2 flex items-center gap-2"
                  onClick={addMetadataField}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Metadata Field
                </Button>
              </div>
              {error && <p className="text-red-600">{error}</p>}
              {success && (
                <p className="text-green-600">Document added successfully!</p>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#FE4A60] text-white border-[3px] border-gray-900 hover:-translate-y-1 hover:-translate-x-1 hover:bg-[#ff6a7a] transition-transform duration-200 shadow-md text-lg font-semibold w-full"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
