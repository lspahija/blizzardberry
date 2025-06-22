'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/app/(frontend)/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/(frontend)/components/ui/card';
import { Input } from '@/app/(frontend)/components/ui/input';
import { Label } from '@/app/(frontend)/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/(frontend)/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/app/(frontend)/components/ui/alert-dialog';
import { useTeams } from '@/app/(frontend)/hooks/useTeams';
import { Team, TeamMemberWithDetails, TeamRole } from '@/app/api/lib/model/team/team';
import { toast } from 'sonner';
import {
  Settings,
  Users,
  Save,
  Trash2,
  UserPlus,
  Loader2,
  Copy,
  CheckCircle2,
  Share2,
  Crown,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsPageProps {
  params: Promise<{ teamSlug: string }>;
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const router = useRouter();
  const { teamSlug } = use(params);
  const { data: session } = useSession();

  const {
    teams,
    updateTeam,
    deleteTeam,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    loading,
    fetchTeams,
    getTeamMembers,
    sendTeamInvitation,
  } = useTeams();

  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamSlugState, setTeamSlugState] = useState('');
  const [members, setMembers] = useState<TeamMemberWithDetails[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<TeamRole>(TeamRole.USER);
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);
  
  const inviteLink = useMemo(() => {
    if (typeof window !== 'undefined' && teamSlug) {
      return `${window.location.origin}/join-team?slug=${teamSlugState}`;
    }
    return '';
  }, [teamSlug, teamSlugState]);

  // Fetch teams when component mounts
  useEffect(() => {
    if (session?.user?.id) {
      console.log('Settings page - fetching teams');
      fetchTeams();
    }
  }, [session?.user?.id, fetchTeams]);

  useEffect(() => {
    if (teamSlug && teams) {
      console.log('Settings page - teamSlug:', teamSlug, 'teams:', teams);
      const team = teams.find((t) => t.slug === teamSlug);
      console.log('Settings page - found team:', team);
      if (team) {
        setCurrentTeam(team);
        setTeamName(team.name);
        setTeamSlugState(team.slug);
      }
    }
  }, [teamSlug, teams]);

  useEffect(() => {
    if (currentTeam) {
      console.log('Settings page - fetching members for teamSlug:', currentTeam.slug);
      fetchTeamMembers();
    }
  }, [currentTeam]);

  const fetchTeamMembers = async () => {
    if (!currentTeam) return;
    try {
      console.log('Settings page - calling fetchTeamMembers');
      const membersData = await getTeamMembers(currentTeam.id);
      console.log('Settings page - members data:', membersData);
      setMembers(membersData);
    } catch (error) {
      toast.error('Failed to load team members');
    }
  };

  const handleSaveTeam = async () => {
    if (!teamName.trim() || !currentTeam) return;
    
    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(teamSlugState.trim())) {
      toast.error('Slug can only contain lowercase letters, numbers, and hyphens');
      return;
    }

    // Validate slug length
    if (teamSlugState.trim().length < 3) {
      toast.error('Slug must be at least 3 characters long');
      return;
    }

    if (teamSlugState.trim().length > 50) {
      toast.error('Slug must be less than 50 characters long');
      return;
    }
    
    setIsSaving(true);
    try {
      await updateTeam(currentTeam.id, { name: teamName, slug: teamSlugState.trim() });
      toast.success('Team settings saved!');
      // Redirect to new slug if it changed
      if (teamSlugState.trim() !== teamSlug) {
        router.push(`/dashboard/${teamSlugState.trim()}/agents`);
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('already taken')) {
        toast.error('This slug is already taken. Please choose a different one.');
      } else {
        toast.error(errorMessage || 'Failed to save settings');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim() || !currentTeam) return;

    setIsAddingMember(true);
    try {
      const success = await sendTeamInvitation(currentTeam.id, newMemberEmail.trim(), newMemberRole);
      if (success) {
        toast.success('Invitation sent successfully!');
        setNewMemberEmail('');
        setNewMemberRole(TeamRole.USER);
      } else {
        toast.error('Failed to send invitation');
      }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to send invitation');
    } finally {
      setIsAddingMember(false);
    }
  };
  
  const handleRoleChange = async (memberId: string, role: TeamRole) => {
      if (!currentTeam) return;
      try {
        await updateTeamMember({
          teamId: currentTeam.id,
          userId: memberId,
          role,
        });
        fetchTeamMembers();
        toast.success("Member's role updated.");
      } catch (error) {
        toast.error((error as Error).message);
      }
  };
  
  const handleRemoveMember = async (memberId: string) => {
    if (!currentTeam) return;
    try {
      await removeTeamMember(currentTeam.id, memberId);
      fetchTeamMembers();
      toast.success('Member removed from team.');
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  const handleDeleteTeam = async () => {
    if (!currentTeam) return;
    setIsDeleting(true);
    try {
      await deleteTeam(currentTeam.id);
      toast.success('Team deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      toast.error((error as Error).message || 'Failed to delete team');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedInviteLink(true);
    setTimeout(() => setCopiedInviteLink(false), 2000);
  };
  
  console.log('Settings page render - loading:', loading, 'currentTeam:', currentTeam, 'teams:', teams);
  
  if (loading || !currentTeam) {
    console.log('Settings page - showing loading state');
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-5xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Team Settings
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl border-l-8 border-l-brand">
              <CardHeader className="flex flex-row items-center space-x-2">
                <Settings className="h-6 w-6 text-brand" />
                <CardTitle className="text-2xl font-bold text-foreground">
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName" className="text-foreground font-semibold">Team Name</Label>
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="border-[2px] border-border rounded-lg p-3 bg-card text-foreground focus:ring-2 focus:ring-brand focus:border-brand transition"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamSlug" className="text-foreground font-semibold">Team Slug</Label>
                  <Input 
                    id="teamSlug" 
                    value={teamSlugState} 
                    onChange={(e) => setTeamSlugState(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="my-team-name"
                    className="border-[2px] border-border rounded-lg p-3 bg-card text-foreground focus:ring-2 focus:ring-brand focus:border-brand transition" 
                  />
                  <p className="text-sm text-muted-foreground">
                    Used for team URLs and invitations. Only lowercase letters, numbers, and hyphens allowed.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border px-6 py-4">
                <Button 
                  onClick={handleSaveTeam} 
                  disabled={isSaving}
                  className="bg-brand text-primary-foreground border-[3px] border-border transition-all duration-200 text-base font-semibold px-6 py-2 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-brand/90"
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl border-l-8 border-l-brand">
              <CardHeader className="flex flex-row items-center space-x-2">
                <Users className="h-6 w-6 text-brand" />
                <CardTitle className="text-2xl font-bold text-foreground">
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.length === 0 ? (
                    <p className="text-muted-foreground text-lg mb-4 flex items-center justify-center">
                      <Users className="h-6 w-6 mr-2 text-brand" />
                      No members found. Invite someone to get started!
                    </p>
                  ) : (
                    members.map((member) => (
                      <div key={member.userId} className="border-t pt-4 sm:pt-2 flex flex-col sm:flex-row sm:items-center transition hover:bg-muted hover:shadow-md rounded-lg group px-4 py-2">
                        <div className="flex flex-1 min-w-0 items-start">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold mr-3 mt-1">
                            {member.userEmail.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-lg text-foreground font-semibold mb-1 truncate">
                              {member.userEmail}
                            </p>
                            <div className="flex items-center gap-2">
                              {member.role === TeamRole.ADMIN ? (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <User className="h-4 w-4 text-blue-500" />
                              )}
                              <span className="text-sm text-muted-foreground">{member.role}</span>
                            </div>
                          </div>
                        </div>
                        {session?.user?.id !== member.userId && (
                          <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0 sm:ml-4">
                            <Select
                              value={member.role}
                              onValueChange={(value) => handleRoleChange(member.userId, value as TeamRole)}
                            >
                              <SelectTrigger className="w-24 border-[2px] border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={TeamRole.USER}>User</SelectItem>
                                <SelectItem value={TeamRole.ADMIN}>Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  className="border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform rounded-full p-2"
                                >
                                  <Trash2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-12" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-[3px] border-border">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-foreground">Remove Member</AlertDialogTitle>
                                  <AlertDialogDescription className="text-muted-foreground">
                                    Are you sure you want to remove {member.userEmail} from the team?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-[2px] border-border">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleRemoveMember(member.userId)}
                                    className="bg-destructive text-destructive-foreground border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl border-l-8 border-l-brand">
              <CardHeader className="flex flex-row items-center space-x-2">
                <UserPlus className="h-6 w-6 text-brand" />
                <CardTitle className="text-2xl font-bold text-foreground">
                  Invite Members
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-semibold">Email address</Label>
                    <Input 
                      id="email" 
                      placeholder="member@example.com" 
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="border-[2px] border-border rounded-lg p-3 bg-card text-foreground focus:ring-2 focus:ring-brand focus:border-brand transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-semibold">Role</Label>
                    <Select value={newMemberRole} onValueChange={(value) => setNewMemberRole(value as TeamRole)}>
                      <SelectTrigger className="w-full border-[2px] border-border rounded-lg p-3 bg-card text-foreground focus:ring-2 focus:ring-brand focus:border-brand transition">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TeamRole.USER}>User</SelectItem>
                        <SelectItem value={TeamRole.ADMIN}>Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-brand text-primary-foreground border-[3px] border-border transition-all duration-200 text-base font-semibold px-6 py-2 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-brand/90" 
                    disabled={isAddingMember}
                  >
                    {isAddingMember && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Invite
                  </Button>
                </form>
                <div className="pt-4 border-t border-border">
                  <Label className="flex items-center gap-2 font-semibold text-foreground">
                    <Share2 className="h-4 w-4 text-brand" />
                    Shareable Link
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input 
                      value={inviteLink} 
                      readOnly 
                      className="border-[2px] border-border rounded-lg p-3 bg-muted text-muted-foreground"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleCopyInviteLink}
                      className="border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                    >
                      {copiedInviteLink ? <CheckCircle2 className="h-4 w-4 text-green-500"/> : <Copy className="h-4 w-4"/>}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-[3px] border-destructive/50 bg-card rounded-xl shadow-xl border-l-8 border-l-destructive">
              <CardHeader className="flex flex-row items-center space-x-2">
                <Trash2 className="h-6 w-6 text-destructive" />
                <CardTitle className="text-2xl font-bold text-destructive">
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  These actions are permanent and cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full bg-destructive text-destructive-foreground border-[3px] border-border transition-all duration-200 text-base font-semibold px-6 py-2 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-destructive/90"
                    >
                      <Trash2 className="mr-2 h-4"/> Delete this team
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-[3px] border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This action cannot be undone. This will permanently delete your
                        team and all of its associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-[2px] border-border">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteTeam} 
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                      >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Yes, delete team
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 