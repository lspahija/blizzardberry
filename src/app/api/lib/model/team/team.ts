export interface Team {
  id: string;
  name: string;
  slug: string;
  createdBy: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  createdAt: string;
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
}

export interface TeamMemberWithDetails extends TeamMember {
  teamName: string;
  teamSlug: string;
  userName: string;
  userEmail: string;
}

export enum TeamRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface CreateTeamParams {
  name: string;
  slug?: string; // Optional, will be auto-generated if not provided
}

export interface AddTeamMemberParams {
  teamId: string;
  userId: string;
  role?: TeamRole; // Defaults to USER if not provided
} 