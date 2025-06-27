import { useState, useCallback, useEffect } from 'react';
import { Agent } from '@/app/api/lib/model/agent/agent';
import posthog from 'posthog-js';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface CreateAgentParams {
  name: string;
  websiteDomain: string;
  model: string;
}

interface UpdateAgentParams extends CreateAgentParams {}

export function useAgents() {
  const { data: session } = useSession();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [updatingAgent, setUpdatingAgent] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoadingAgents(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleDeleteAgent = useCallback(
    async (agentId: string) => {
      if (
        !confirm(
          'Are you sure you want to delete this agent? This action cannot be undone.'
        )
      ) {
        return;
      }

      posthog.capture('agent_delete_attempt', {
        agent_id: agentId,
        user_email: session?.user?.email,
      });

      setDeletingAgentId(agentId);
      try {
        const response = await fetch(`/api/agents/${agentId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete agent');
        }

        setAgents(agents.filter((agent) => agent.id !== agentId));
      } catch (error) {
        console.error('Error deleting agent:', error);
        toast.error('Failed to delete agent. Please try again.');
      } finally {
        setDeletingAgentId(null);
      }
    },
    [agents]
  );

  const handleCreateAgent = useCallback(
    async ({ name, websiteDomain, model }: CreateAgentParams) => {
      setCreatingAgent(true);
      try {
        const response = await fetch('/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, websiteDomain, model }),
        });

        if (!response.ok) {
          throw new Error('Failed to create agent');
        }

        const { agentId } = await response.json();
        await fetchAgents(); // Refresh the list
        return { agentId };
      } catch (error) {
        console.error('Error creating agent:', error);
        toast.error('Failed to create agent. Please try again.');
        throw error;
      } finally {
        setCreatingAgent(false);
      }
    },
    [fetchAgents]
  );

  const handleUpdateAgent = useCallback(
    async (
      agentId: string,
      { name, websiteDomain, model }: UpdateAgentParams
    ) => {
      setUpdatingAgent(true);
      try {
        const response = await fetch(`/api/agents/${agentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, websiteDomain, model }),
        });

        if (!response.ok) {
          throw new Error('Failed to update agent');
        }

        await fetchAgents(); // Refresh the list
      } catch (error) {
        console.error('Error updating agent:', error);
        toast.error('Failed to update agent. Please try again.');
        throw error;
      } finally {
        setUpdatingAgent(false);
      }
    },
    [fetchAgents]
  );

  return {
    agents,
    loadingAgents,
    deletingAgentId,
    creatingAgent,
    updatingAgent,
    fetchAgents,
    handleDeleteAgent,
    handleCreateAgent,
    handleUpdateAgent,
  };
}
