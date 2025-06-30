import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Document } from '@/app/api/lib/model/document/document';
import { toast } from 'sonner';

interface MetadataField {
  key: string;
  value: string;
}

export const useDocuments = () => {
  const router = useRouter();
  const { agentId } = useParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}/documents`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error(`Error fetching documents for agent ${agentId}:`, error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [agentId]);

  const handleDeleteDocument = async (documentId: string) => {

    setDeletingDocumentId(documentId);
    try {
      const response = await fetch(
        `/api/agents/${agentId}/documents/${documentId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      setDocuments(documents.filter((doc) => doc.id !== documentId));
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document. Please try again.');
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

    // Filter out invalid metadata fields (empty key or value)
    const validMetadataFields = metadataFields.filter(
      (field) => field.key.trim() !== '' && field.value.trim() !== ''
    );

    // Construct metadata object, including agentId
    const metadata = validMetadataFields.reduce((acc, field) => {
      acc[field.key.trim()] = field.value.trim();
      return acc;
    }, {});

    try {
      const response = await fetch(`/api/agents/${agentId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          metadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add document');
      }

      setSuccess(true);
      await fetchDocuments();
      setTimeout(() => router.push(`/agents/${agentId}`), 2000);
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
