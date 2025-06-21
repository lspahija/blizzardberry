import { useState, useCallback } from 'react';
import { Team, TeamRole, TeamMemberWithDetails } from '@/app/api/lib/model/team/team';
import { useSession } from 'next-auth/react';

interface CreateTeamParams {
  name: string;
  slug?: string;
}

interface AddMemberParams {
  teamId: string;
  userId: string;
  role?: TeamRole;
}

interface UpdateMemberParams {
  teamId: string;
  userId: string;
  role: TeamRole;
}

export function useTeams() {
  const [teams, setTeams] = useState<Array<Team & { role: TeamRole; isAdmin: boolean }> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchTeams = useCallback(async () => {
    if (!session?.user?.id) {
      console.log('No session user ID, skipping fetchTeams');
      return;
    }

    console.log('Fetching teams for user:', session.user.id);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/teams', { cache: 'no-store' });
      console.log('Teams API response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }

      const data = await response.json();
      console.log('Teams API response data:', data);
      setTeams(data.teams || []);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const createTeam = useCallback(async (params: CreateTeamParams): Promise<Team | null> => {
    if (!session?.user?.id) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create team');
      }

      const data = await response.json();
      
      // Refresh teams list
      await fetchTeams();
      
      return data.team;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, fetchTeams]);

  const updateTeam = useCallback(async (teamId: string, params: CreateTeamParams): Promise<Team | null> => {
    if (!session?.user?.id) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update team');
      }

      const data = await response.json();
      
      // Refresh teams list
      await fetchTeams();
      
      return data.team;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, fetchTeams]);

  const deleteTeam = useCallback(async (teamId: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete team');
      }

      // Refresh teams list
      await fetchTeams();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, fetchTeams]);

  const getTeamMembers = useCallback(async (teamId: string): Promise<TeamMemberWithDetails[]> => {
    if (!session?.user?.id) return [];

    try {
      const response = await fetch(`/api/teams/${teamId}/members`);
      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      const data = await response.json();
      return data.members;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    }
  }, [session?.user?.id]);

  const addTeamMember = useCallback(async (params: AddMemberParams): Promise<boolean> => {
    if (!session?.user?.id) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${params.teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: params.userId,
          role: params.role || TeamRole.USER,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add team member');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const updateTeamMember = useCallback(async (params: UpdateMemberParams): Promise<boolean> => {
    if (!session?.user?.id) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${params.teamId}/members/${params.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: params.role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update team member');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const removeTeamMember = useCallback(async (teamId: string, userId: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove team member');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  return {
    teams,
    loading,
    error,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    getTeamMembers,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
  };
} 