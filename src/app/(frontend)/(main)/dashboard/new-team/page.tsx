'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/(frontend)/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/(frontend)/components/ui/card';
import { Input } from '@/app/(frontend)/components/ui/input';
import { Label } from '@/app/(frontend)/components/ui/label';
import { useTeams } from '@/app/(frontend)/hooks/useTeams';
import { toast } from 'sonner';
import {
  Users,
  Crown,
  PlusCircle,
  Search,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

export default function NewTeamPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [newTeamName, setNewTeamName] = useState('');
  const [joinTeamSlug, setJoinTeamSlug] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  const { teams, loading, fetchTeams, createTeam } = useTeams();

  useEffect(() => {
    if (session?.user?.id) {
      fetchTeams();
    }
  }, [session?.user?.id, fetchTeams]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    setIsCreatingTeam(true);
    try {
      const newTeam = await createTeam({ name: newTeamName.trim() });
      if (newTeam) {
        toast.success(`Team "${newTeam.name}" created successfully!`);
        router.push(`/dashboard/${newTeam.id}/agents`);
      }
    } catch (error) {
      toast.error(
        (error as Error).message || 'Failed to create team. Please try again.'
      );
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleJoinTeam = async () => {
    toast.info('Joining teams by slug is coming soon!');
  };

  const filteredTeams =
    teams?.filter(
      (team) =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.slug.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];

  return (
    <motion.div
      className="min-h-screen bg-background p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Create or Join a Team
          </h1>
          <p className="text-xl text-muted-foreground">
            Collaborate with your colleagues by creating or joining a team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                <PlusCircle className="h-6 w-6 text-brand" />
                Create a New Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <Label htmlFor="newTeamName" className="font-semibold mb-2 block">
                  Team Name
                </Label>
                <Input
                  id="newTeamName"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g., Marketing Squad"
                  className="border-[2px] border-border"
                />
              </div>
              <Button
                onClick={handleCreateTeam}
                disabled={isCreatingTeam}
                className="w-full bg-brand text-primary-foreground border-[3px] border-border transition-all duration-200 text-base font-semibold px-6 py-2 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-brand/90"
              >
                {isCreatingTeam ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Create Team'
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                <UserPlus className="h-6 w-6 text-brand" />
                Join a Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <Label htmlFor="joinTeamSlug" className="font-semibold mb-2 block">
                  Team Slug
                </Label>
                <Input
                  id="joinTeamSlug"
                  value={joinTeamSlug}
                  onChange={(e) => setJoinTeamSlug(e.target.value)}
                  placeholder="e.g., marketing-squad-a1b2"
                  className="border-[2px] border-border"
                />
              </div>
              <Button
                onClick={handleJoinTeam}
                className="w-full bg-secondary text-secondary-foreground border-[3px] border-border transition-all duration-200 text-base font-semibold px-6 py-2 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-secondary/90"
              >
                Join Team
              </Button>
            </CardContent>
          </Card>
        </div>

        {loading && !teams && (
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin inline-block text-brand" />
            <p className="text-muted-foreground mt-2">Loading your teams...</p>
          </div>
        )}

        {teams && teams.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-center text-foreground mb-8">
              Your Existing Teams
            </h2>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-[2px] border-border"
                />
              </div>
            </div>
            <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl">
              <CardContent className="p-4">
                <div className="space-y-2">
                  {filteredTeams.map((team) => (
                    <div
                      key={team.id}
                      className="p-4 flex items-center justify-between rounded-lg cursor-pointer transition-all hover:bg-muted/50"
                      onClick={() => router.push(`/dashboard/${team.id}/agents`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-muted p-3 rounded-lg">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground text-lg">
                            {team.name}
                          </span>
                          <p className="text-sm text-muted-foreground">
                            {team.slug}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {team.role === 'ADMIN' && (
                          <div className="flex items-center gap-1 bg-brand/10 text-brand text-xs font-medium px-2 py-1 rounded-full">
                            <Crown className="h-3 w-3" />
                            Admin
                          </div>
                        )}
                        {team.role === 'USER' && (
                            <div className="flex items-center gap-1 bg-secondary/20 text-secondary-foreground text-xs font-medium px-2 py-1 rounded-full">
                                <Users className="h-3 w-3" />
                                User
                            </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredTeams.length === 0 && (
                     <p className="text-center text-muted-foreground py-4">
                        No teams match your search.
                     </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </motion.div>
  );
} 
