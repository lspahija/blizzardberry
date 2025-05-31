import { useState, useCallback } from 'react';
import { Chatbot } from '@/app/api/lib/model/chatbot/chatbot';

interface CreateChatbotParams {
  name: string;
  websiteDomain: string;
}

export function useChatbots() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loadingChatbots, setLoadingChatbots] = useState(true);
  const [deletingChatbotId, setDeletingChatbotId] = useState<string | null>(null);
  const [creatingChatbot, setCreatingChatbot] = useState(false);

  const fetchChatbots = useCallback(async () => {
    try {
      const response = await fetch('/api/chatbots');
      if (!response.ok) {
        throw new Error('Failed to fetch chatbots');
      }
      const data = await response.json();
      setChatbots(data.chatbots || []);
    } catch (error) {
      console.error('Error fetching chatbots:', error);
    } finally {
      setLoadingChatbots(false);
    }
  }, []);

  const handleDeleteChatbot = useCallback(async (chatbotId: string) => {
    if (!confirm('Are you sure you want to delete this chatbot? This action cannot be undone.')) {
      return;
    }

    setDeletingChatbotId(chatbotId);
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chatbot');
      }

      setChatbots(chatbots.filter(chatbot => chatbot.id !== chatbotId));
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      alert('Failed to delete chatbot. Please try again.');
    } finally {
      setDeletingChatbotId(null);
    }
  }, [chatbots]);

  const handleCreateChatbot = useCallback(async ({ name, websiteDomain }: CreateChatbotParams) => {
    setCreatingChatbot(true);
    try {
      const response = await fetch('/api/chatbots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, websiteDomain }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chatbot');
      }

      const { chatbotId } = await response.json();
      await fetchChatbots(); // Refresh the list
      return { chatbotId };
    } catch (error) {
      console.error('Error creating chatbot:', error);
      alert('Failed to create chatbot. Please try again.');
      throw error;
    } finally {
      setCreatingChatbot(false);
    }
  }, [fetchChatbots]);

  return {
    chatbots,
    loadingChatbots,
    deletingChatbotId,
    creatingChatbot,
    fetchChatbots,
    handleDeleteChatbot,
    handleCreateChatbot,
  };
} 