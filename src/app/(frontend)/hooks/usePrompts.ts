import { useState, useCallback, useEffect } from 'react';
import { Prompt } from '@/app/api/lib/model/prompt/prompt';
import { toast } from 'sonner';

export function usePrompts(agentId: string) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [creatingPrompt, setCreatingPrompt] = useState(false);
  const [deletingPromptId, setDeletingPromptId] = useState<string | null>(null);

  const fetchPrompts = useCallback(async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}/prompts`);
      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }
      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoadingPrompts(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleCreatePrompt = useCallback(
    async (content: string) => {
      setCreatingPrompt(true);
      try {
        const response = await fetch(`/api/agents/${agentId}/prompts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          throw new Error('Failed to create prompt');
        }

        await fetchPrompts(); // Refresh the list
        toast.success('Prompt created successfully');
      } catch (error) {
        console.error('Error creating prompt:', error);
        toast.error('Failed to create prompt. Please try again.');
        throw error;
      } finally {
        setCreatingPrompt(false);
      }
    },
    [agentId, fetchPrompts]
  );

  const handleDeletePrompt = useCallback(
    async (promptId: string) => {
      setDeletingPromptId(promptId);
      try {
        const response = await fetch(
          `/api/agents/${agentId}/prompts/${promptId}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete prompt');
        }

        setPrompts(prompts.filter((prompt) => prompt.id !== promptId));
        toast.success('Prompt deleted successfully');
      } catch (error) {
        console.error('Error deleting prompt:', error);
        toast.error('Failed to delete prompt. Please try again.');
      } finally {
        setDeletingPromptId(null);
      }
    },
    [agentId, prompts]
  );

  return {
    prompts,
    loadingPrompts,
    creatingPrompt,
    deletingPromptId,
    fetchPrompts,
    handleCreatePrompt,
    handleDeletePrompt,
  };
}
