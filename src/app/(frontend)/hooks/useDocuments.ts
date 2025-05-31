import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Document } from '@/app/api/lib/model/document/document';

interface MetadataField {
  key: string;
  value: string;
}

export const useDocuments = () => {
  const router = useRouter();
  const { chatbotId } = useParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/documents/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatbotId }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error(
        `Error fetching documents for chatbot ${chatbotId}:`,
        error
      );
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [chatbotId]);

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setDeletingDocumentId(documentId);
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      // Update the documents list in state
      setDocuments(documents.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    } finally {
      setDeletingDocumentId(null);
    }
  };

  const handleCreateDocument = async (
    text: string,
    metadataFields: MetadataField[]
  ) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    // Construct metadata object, including chatbotId
    const metadata = metadataFields.reduce(
      (acc, field) => {
        if (field.key && field.value) {
          acc[field.key] = field.value;
        }
        return acc;
      },
      { chatbot_id: chatbotId } as Record<string, string>
    );

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          metadata,
          chatbotId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add document');
      }

      setSuccess(true);
      // Refresh the documents list
      await fetchDocuments();
      // Navigate back to the chatbot page after a short delay
      setTimeout(() => router.push(`/chatbots/${chatbotId}`), 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding the document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    documents,
    loadingDocuments,
    deletingDocumentId,
    handleDeleteDocument,
    handleCreateDocument,
    isSubmitting,
    error,
    success,
  };
}; 