import { useState, useCallback, useContext } from 'react';
import { Agent, CreateAgentParams } from '@/app/api/lib/model/agent/agent';
import posthog from 'posthog-js';
import { useSession } from 'next-auth/react';
import { TeamContext } from '../contexts/TeamContext';

interface UpdateAgentParams extends Partial<CreateAgentParams> {}

export function useAgents(teamId?: string) {
  const { data: session } = useSession();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [updatingAgent, setUpdatingAgent] = useState(false);
  const { currentTeam } = useContext(TeamContext);

  const activeTeamId = teamId || currentTeam?.id;

  const fetchAgents = useCallback(async () => {
    if (!session?.user?.id || !activeTeamId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${activeTeamId}/agents`);
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      const data = await response.json();
      setAgents(data.agents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, activeTeamId]);

  const handleDeleteAgent = useCallback(async (agentId: string) => {
    if (!activeTeamId) return;
    setDeletingAgentId(agentId);
    try {
      const response = await fetch(`/api/teams/${activeTeamId}/agents/${agentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }
      await fetchAgents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDeletingAgentId(null);
    }
  }, [activeTeamId, fetchAgents]);

  const handleCreateAgent = useCallback(
    async (params: CreateAgentParams) => {
      if (!session?.user?.id) return null;

      setCreatingAgent(true);
      setError(null);

      try {
        const response = await fetch('/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create agent');
        }

        const data = await response.json();
        
        // Track the event
        posthog.capture('agent_created', {
          agentId: data.agentId,
          model: params.model,
          teamId: params.teamId,
        });
        
        // Refresh agents list
        await fetchAgents();
        
        return data.agentId;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        return null;
      } finally {
        setCreatingAgent(false);
      }
    },
    [session?.user?.id, fetchAgents]
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
        alert('Failed to update agent. Please try again.');
        throw error;
      } finally {
        setUpdatingAgent(false);
      }
    },
    [fetchAgents]
  );

  return {
    agents,
    loading,
    error,
    deletingAgentId,
    creatingAgent,
    updatingAgent,
    fetchAgents,
    handleDeleteAgent,
    handleCreateAgent,
    handleUpdateAgent,
  };
}
