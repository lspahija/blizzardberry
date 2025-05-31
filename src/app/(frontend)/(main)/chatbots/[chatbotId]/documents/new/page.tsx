'use client';

import { useState } from 'react';
import { use } from 'react';
import { Button } from '@/app/(frontend)/components/ui/button';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/app/(frontend)/components/ui/card';
import { Loader2, ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';
import { Input } from '@/app/(frontend)/components/ui/input';
import { Label } from '@/app/(frontend)/components/ui/label';
import { Textarea } from '@/app/(frontend)/components/ui/textarea';
import { Dropzone } from '@/app/(frontend)/components/ui/dropzone';
import { useDocuments } from '@/app/(frontend)/hooks/useDocuments';

interface MetadataField {
  key: string;
  value: string;
}

export default function AddDocument({
  params: paramsPromise,
}: {
  params: Promise<{ chatbotId: string }>;
}) {
  const params = use(paramsPromise);
  const [text, setText] = useState('');
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([
    { key: '', value: '' },
  ]);
  const {
    handleCreateDocument,
    isSubmitting,
    error,
    success,
  } = useDocuments();

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Add New Document
          </h1>
          <Button
            asChild
            className="bg-[#FE4A60] text-white border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
          >
            <a href={`/chatbots/${params.chatbotId}`} className="flex items-center">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Chatbot
            </a>
          </Button>
        </div>

        <Card className="border-[3px] border-gray-900 bg-[#FFFDF8]">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              Document Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="text"
                  className="block text-sm font-medium text-gray-900"
                >
                  Document Content
                </Label>
                <p className="text-sm text-gray-600 mt-1">
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
                    className="mt-2 block w-full rounded-md border-gray-900 border-[2px] shadow-sm focus:border-[#FE4A60] focus:ring-[#FE4A60] sm:text-sm p-2"
                    rows={10}
                    placeholder="Enter the document text here..."
                  />
                </div>
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-900">
                  Metadata (Optional)
                </Label>
                <p className="text-sm text-gray-600 mt-1">
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
                        className="bg-[#FFFDF8] text-gray-900 border-[2px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                        onClick={() => removeMetadataField(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="mt-4 bg-[#FFFDF8] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                  onClick={addMetadataField}
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
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
                className="bg-[#FE4A60] text-white border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
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
