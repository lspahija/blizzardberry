'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useTeams } from '../hooks/useTeams';
import { Team } from '@/app/api/lib/model/team/team';

interface TeamContextType {
  teams: Team[];
  currentTeam: Team | null;
  setCurrentTeamId: (teamId: string) => void;
  loading: boolean;
}

export const TeamContext = createContext<Partial<TeamContextType>>({});

export function TeamProvider({ children }: { children: ReactNode }) {
  const { teams, loading, fetchTeams } = useTeams();
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  useEffect(() => {
    if (teams.length > 0) {
      const teamId = localStorage.getItem('currentTeamId');
      if (teamId && teams.some(t => t.id === teamId)) {
        setCurrentTeam(teams.find(t => t.id === teamId) || null);
      } else {
        setCurrentTeam(teams[0]);
        localStorage.setItem('currentTeamId', teams[0].id);
      }
    }
  }, [teams]);

  const handleSetCurrentTeamId = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setCurrentTeam(team);
      localStorage.setItem('currentTeamId', teamId);
    }
  };

  return (
    <TeamContext.Provider value={{ teams, currentTeam, setCurrentTeamId: handleSetCurrentTeamId, loading }}>
      {children}
    </TeamContext.Provider>
  );
} 