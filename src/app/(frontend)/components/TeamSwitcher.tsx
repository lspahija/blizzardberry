'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { ChevronDown, Users, Crown, Plus, Settings } from 'lucide-react';
import { Button } from '@/app/(frontend)/components/ui/button';
import { useTeams } from '@/app/(frontend)/hooks/useTeams';
import { TeamRole } from '@/app/api/lib/model/team/team';
import { toast } from 'sonner';

interface TeamSwitcherProps {
  currentTeamId?: string;
  onTeamChange?: (teamId: string) => void;
}

export function TeamSwitcher({ currentTeamId, onTeamChange }: TeamSwitcherProps) {
  const { data: session } = useSession();
  const { teams, loading, fetchTeams, createTeam } = useTeams();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchTeams();
    }
  }, [session?.user?.id, fetchTeams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (teams === undefined || loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-[2px] border-muted bg-muted/50">
        <div className="w-4 h-4 bg-muted animate-pulse rounded"></div>
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const currentTeam = teams.find(team => team.id === currentTeamId) || teams[0];

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    setIsCreatingTeam(true);
    try {
      const newTeam = await createTeam({ name: newTeamName.trim() });
      if (newTeam) {
        setNewTeamName('');
        toast.success(`Team "${newTeam.name}" created successfully!`);
        // Switch to the new team
        onTeamChange?.(newTeam.id);
        setIsOpen(false);
      }
    } catch (error) {
      toast.error('Failed to create team');
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleTeamSelect = (teamId: string) => {
    onTeamChange?.(teamId);
    setIsOpen(false);
  };

  if (!teams.length) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-[2px] border-muted bg-muted/50">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">No teams</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-900 border-[2px] border-transparent hover:border-muted hover:bg-muted rounded-lg transition min-w-0"
      >
        <Users className="h-4 w-4" />
        <span className="truncate max-w-[120px]">
          {currentTeam?.name || 'Select Team'}
        </span>
        {currentTeam?.isAdmin && (
          <Crown className="h-3 w-3 text-yellow-600" />
        )}
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-card border-[2px] border-border rounded-lg shadow-lg z-50">
          <div className="px-3 py-2 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Your Teams</h3>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => handleTeamSelect(team.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted transition-colors text-left ${
                  team.id === currentTeamId ? 'bg-muted' : ''
                }`}
              >
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-foreground truncate">
                      {team.name}
                    </span>
                    {team.isAdmin && (
                      <Crown className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="capitalize">{team.role.toLowerCase()}</span>
                    <span>•</span>
                    <span className="truncate">{team.slug}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-border">
            <div className="px-3 py-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New team name..."
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTeam()}
                  className="flex-1 px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <Button
                  size="sm"
                  onClick={handleCreateTeam}
                  disabled={isCreatingTeam || !newTeamName.trim()}
                  className="px-2 py-1 h-auto"
                >
                  {isCreatingTeam ? (
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-border">
            <button className="w-full flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted transition-colors text-left">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Team Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 