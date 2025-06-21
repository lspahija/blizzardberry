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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/(frontend)/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/(frontend)/components/ui/dialog';
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
import { TeamRole } from '@/app/api/lib/model/team/team';
import { toast } from 'sonner';
import {
  Settings,
  Users,
  Crown,
  Edit,
  Trash2,
  Save,
  X,
  UserPlus,
  Shield,
  AlertTriangle,
  Loader2,
  Mail,
  Copy,
  CheckCircle2,
  Search,
  MoreVertical,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsPageProps {
  params: Promise<{ teamId: string }>;
}

interface TeamMember {
  id: string;
  userId: string;
  role: TeamRole;
  userName: string;
  userEmail: string;
  createdAt: string;
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const router = useRouter();
  const [teamId, setTeamId] = useState<string>('');
  const [currentTeam, setCurrentTeam] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isUpdatingMember, setIsUpdatingMember] = useState(false);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  
  // Form states
  const [teamName, setTeamName] = useState('');
  const [teamSlug, setTeamSlug] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<TeamRole>(TeamRole.USER);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);
  
  // Member management
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [memberRoleUpdates, setMemberRoleUpdates] = useState<Record<string, TeamRole>>({});
  
  const {
    teams,
    loading,
    fetchTeams,
    updateTeam,
    deleteTeam,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
  } = useTeams();

  // Get teamId from URL params
  useEffect(() => {
    params.then(({ teamId }) => {
      setTeamId(teamId);
    });
  }, [params]);

  // Load team data
  useEffect(() => {
    if (teamId && teams.length > 0) {
      const team = teams.find(t => t.id === teamId);
      if (team) {
        setCurrentTeam(team);
        setTeamName(team.name);
        setTeamSlug(team.slug);
        setIsLoading(false);
      }
    }
  }, [teamId, teams]);

  // Load team members
  useEffect(() => {
    if (teamId) {
      fetchTeamMembers();
    }
  }, [teamId]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members);
      }
    } catch (error) {
      toast.error('Failed to load team members');
    }
  };

  const handleSaveTeam = async () => {
    if (!teamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    setIsSaving(true);
    try {
      const success = await updateTeam(teamId, {
        name: teamName.trim(),
        slug: teamSlug.trim(),
      });
      
      if (success) {
        toast.success('Team updated successfully!');
        await fetchTeams();
      }
    } catch (error) {
      toast.error('Failed to update team');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteTeam(teamId);
      if (success) {
        toast.success('Team deleted successfully!');
        await fetchTeams();
        // Navigate to first available team or dashboard
        if (teams.length > 1) {
          const otherTeam = teams.find(t => t.id !== teamId);
          if (otherTeam) {
            router.push(`/dashboard/${otherTeam.id}`);
          }
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      toast.error('Failed to delete team');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    setIsAddingMember(true);
    try {
      // For now, we'll use a placeholder user ID
      // In a real app, you'd search for users by email or send an invitation
      const success = await addTeamMember({
        teamId,
        userId: 'placeholder-user-id', // This should be replaced with actual user lookup
        role: newMemberRole,
      });
      
      if (success) {
        setNewMemberEmail('');
        setNewMemberRole(TeamRole.USER);
        toast.success('Member added successfully!');
        await fetchTeamMembers();
      }
    } catch (error) {
      toast.error('Failed to add member');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: TeamRole) => {
    setIsUpdatingMember(true);
    try {
      const success = await updateTeamMember({
        teamId,
        userId: memberId,
        role: newRole,
      });
      if (success) {
        toast.success('Member role updated successfully!');
        await fetchTeamMembers();
        setEditingMember(null);
      }
    } catch (error) {
      toast.error('Failed to update member role');
    } finally {
      setIsUpdatingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setIsRemovingMember(true);
    try {
      const success = await removeTeamMember(teamId, memberId);
      if (success) {
        toast.success('Member removed successfully!');
        await fetchTeamMembers();
      }
    } catch (error) {
      toast.error('Failed to remove member');
    } finally {
      setIsRemovingMember(false);
    }
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join/${teamId}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedInviteLink(true);
    toast.success('Invite link copied to clipboard!');
    setTimeout(() => setCopiedInviteLink(false), 2000);
  };

  const filteredMembers = members.filter(member => 
    member.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAdmin = currentTeam?.isAdmin;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading team settings...</span>
        </div>
      </div>
    );
  }

  if (!currentTeam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Team Not Found</h2>
          <p className="text-muted-foreground mb-4">The team you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Team Settings</h1>
          <p className="text-muted-foreground">Manage your team's information and members</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Information */}
          <div className="lg:col-span-2">
            <Card className="border-[2px] border-border">
              <CardHeader className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-brand" />
                <CardTitle className="text-xl">Team Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="teamName" className="text-foreground font-medium">
                    Team Name
                  </Label>
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="mt-1"
                    disabled={!isAdmin}
                  />
                </div>
                <div>
                  <Label htmlFor="teamSlug" className="text-foreground font-medium">
                    Team Slug
                  </Label>
                  <Input
                    id="teamSlug"
                    value={teamSlug}
                    onChange={(e) => setTeamSlug(e.target.value)}
                    placeholder="Enter team slug"
                    className="mt-1"
                    disabled={!isAdmin}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This is used for team URLs and invitations
                  </p>
                </div>
                {isAdmin && (
                  <Button
                    onClick={handleSaveTeam}
                    disabled={isSaving}
                    className="bg-brand text-primary-foreground hover:bg-brand/90"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card className="border-[2px] border-border mt-6">
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-brand" />
                  <CardTitle className="text-xl">Team Members</CardTitle>
                </div>
                {isAdmin && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-brand text-primary-foreground hover:bg-brand/90">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="newMemberEmail">Email Address</Label>
                          <Input
                            id="newMemberEmail"
                            type="email"
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                            placeholder="user@example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="newMemberRole">Role</Label>
                          <Select value={newMemberRole} onValueChange={(value) => setNewMemberRole(value as TeamRole)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={TeamRole.USER}>User</SelectItem>
                              <SelectItem value={TeamRole.ADMIN}>Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={handleAddMember}
                          disabled={isAddingMember}
                          className="w-full"
                        >
                          {isAddingMember ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <UserPlus className="h-4 w-4 mr-2" />
                          )}
                          Add Member
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {filteredMembers.map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {member.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{member.userName}</p>
                          <p className="text-sm text-muted-foreground">{member.userEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingMember === member.id ? (
                          <div className="flex items-center gap-2">
                            <Select
                              value={memberRoleUpdates[member.id] || member.role}
                              onValueChange={(value) => 
                                setMemberRoleUpdates(prev => ({ ...prev, [member.id]: value as TeamRole }))
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={TeamRole.USER}>User</SelectItem>
                                <SelectItem value={TeamRole.ADMIN}>Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateMemberRole(member.id, memberRoleUpdates[member.id] || member.role)}
                              disabled={isUpdatingMember}
                            >
                              {isUpdatingMember ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Save className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingMember(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              member.role === TeamRole.ADMIN 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {member.role}
                            </span>
                            {isAdmin && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingMember(member.id)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                            {isAdmin && member.role !== TeamRole.ADMIN && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove {member.userName} from the team? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveMember(member.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Invite Link */}
            <Card className="border-[2px] border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Invite Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/join/${teamId}`}
                    readOnly
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={handleCopyInviteLink}
                    variant="outline"
                    size="sm"
                  >
                    {copiedInviteLink ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this link with others to invite them to your team
                </p>
              </CardContent>
            </Card>

            {/* Team Stats */}
            <Card className="border-[2px] border-border">
              <CardHeader>
                <CardTitle className="text-lg">Team Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Members</span>
                  <span className="font-medium">{members.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Admins</span>
                  <span className="font-medium">
                    {members.filter(m => m.role === TeamRole.ADMIN).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {new Date(currentTeam.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            {isAdmin && (
              <Card className="border-[2px] border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Team
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Team</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this team? This action cannot be undone and will remove all team data, agents, and members.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteTeam}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Team
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 