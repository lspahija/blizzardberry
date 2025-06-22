import { useState, useCallback, useContext, useEffect } from 'react';
import { Agent, CreateAgentParams } from '@/app/api/lib/model/agent/agent';
import posthog from 'posthog-js';
import { useSession } from 'next-auth/react';
import { TeamContext } from '../contexts/TeamContext';

interface UpdateAgentParams extends Partial<CreateAgentParams> {}

export function useAgents(teamSlug?: string) {
  const { data: session } = useSession();
  const { teams, loading: teamsLoading } = useContext(TeamContext);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [updatingAgent, setUpdatingAgent] = useState(false);

  const fetchAgents = useCallback(async () => {
    if (!session?.user?.id || !teamSlug) return;

    setLoading(true);
    setError(null);

    try {
      // We need to look up the team from the context to get its ID for the API call.
      const team = teams?.find(t => t.slug === teamSlug);
      if (!team) {
        // This can happen if the teams are not loaded yet, or the slug is invalid.
        // The UI should handle this by showing a loading or error state.
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/teams/${team.id}/agents`);
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
  }, [session?.user?.id, teamSlug, teams]);

  useEffect(() => {
    // Only fetch agents if the team context is done loading and we have a slug.
    if (!teamsLoading && teamSlug) {
      fetchAgents();
    }
  }, [teamSlug, teamsLoading, fetchAgents]);


  const handleDeleteAgent = useCallback(async (agentId: string) => {
    const team = teams?.find(t => t.slug === teamSlug);
    if (!team) return;

    setDeletingAgentId(agentId);
    try {
      const response = await fetch(`/api/teams/${team.id}/agents/${agentId}`, {
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
  }, [teamSlug, teams, fetchAgents]);

  const handleCreateAgent = useCallback(
    async (params: Omit<CreateAgentParams, 'teamId'>) => {
      const team = teams?.find(t => t.slug === teamSlug);
      if (!session?.user?.id || !team) return null;

      setCreatingAgent(true);
      setError(null);

      try {
        const response = await fetch(`/api/teams/${team.id}/agents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...params, teamId: team.id }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create agent');
        }

        const data = await response.json();
        
        posthog.capture('agent_created', {
          agentId: data.agentId,
          model: params.model,
          teamId: team.id,
        });
        
        await fetchAgents();
        
        return data.agentId;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        return null;
      } finally {
        setCreatingAgent(false);
      }
    },
    [session?.user?.id, teamSlug, teams, fetchAgents]
  );

  const handleUpdateAgent = useCallback(
    async (
      agentId: string,
      { name, websiteDomain, model }: UpdateAgentParams
    ) => {
      const team = teams?.find(t => t.slug === teamSlug);
      if (!team) return;

      setUpdatingAgent(true);
      try {
        const response = await fetch(`/api/teams/${team.id}/agents/${agentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, websiteDomain, model }),
        });

        if (!response.ok) {
          throw new Error('Failed to update agent');
        }

        await fetchAgents();
      } catch (error) {
        console.error('Error updating agent:', error);
        alert('Failed to update agent. Please try again.');
        throw error;
      } finally {
        setUpdatingAgent(false);
      }
    },
    [teamSlug, teams, fetchAgents]
  );

  return {
    agents,
    loading,
    error,
    deletingAgentId,
    creatingAgent,
    updatingAgent,
    handleDeleteAgent,
    handleCreateAgent,
    handleUpdateAgent,
  };
}
