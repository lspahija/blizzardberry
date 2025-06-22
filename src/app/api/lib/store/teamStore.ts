import sql from '@/app/api/lib/store/db';
import { Team, TeamMember, TeamRole, TeamWithMembers, TeamMemberWithDetails } from '@/app/api/lib/model/team/team';

export async function getTeam(teamId: string): Promise<Team | null> {
  const [team] = await sql`
    SELECT id, name, slug, created_by, created_at
    FROM teams
    WHERE id = ${teamId}
    LIMIT 1
  `;

  if (!team) return null;

  return {
    id: team.id,
    name: team.name,
    slug: team.slug,
    createdBy: team.created_by,
    createdAt: team.created_at,
  };
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  const [team] = await sql`
    SELECT id, name, slug, created_by, created_at
    FROM teams
    WHERE slug = ${slug}
    LIMIT 1
  `;

  if (!team) return null;

  return {
    id: team.id,
    name: team.name,
    slug: team.slug,
    createdBy: team.created_by,
    createdAt: team.created_at,
  };
}

export async function getUserTeams(userId: string): Promise<Team[]> {
  const teams = await sql`
    SELECT t.id, t.name, t.slug, t.created_by, t.created_at
    FROM teams t
    JOIN team_members tm ON t.id = tm.team_id
    WHERE tm.user_id = ${userId}
    ORDER BY t.created_at DESC
  `;

  return teams.map((team: any) => ({
    id: team.id,
    name: team.name,
    slug: team.slug,
    createdBy: team.created_by,
    createdAt: team.created_at,
  }));
}

export async function getUserTeamsWithRoles(userId: string): Promise<Array<Team & { role: TeamRole; isAdmin: boolean }>> {
  const teams = await sql`
    SELECT 
      t.id, 
      t.name, 
      t.slug, 
      t.created_by, 
      t.created_at,
      tm.role,
      tm.role = 'ADMIN'::team_role as is_admin
    FROM teams t
    JOIN team_members tm ON t.id = tm.team_id
    WHERE tm.user_id = ${userId}
    ORDER BY t.created_at DESC
  `;

  return teams.map((team: any) => ({
    id: team.id,
    name: team.name,
    slug: team.slug,
    createdBy: team.created_by,
    createdAt: team.created_at,
    role: team.role,
    isAdmin: team.is_admin,
  }));
}

export async function getTeamMembers(teamId: string): Promise<TeamMemberWithDetails[]> {
  const members = await sql`
    SELECT 
      tm.id,
      tm.team_id,
      tm.user_id,
      tm.role,
      tm.created_at,
      t.name as team_name,
      t.slug as team_slug,
      u.name as user_name,
      u.email as user_email
    FROM team_members tm
    JOIN teams t ON tm.team_id = t.id
    JOIN next_auth.users u ON tm.user_id = u.id
    WHERE tm.team_id = ${teamId}
    ORDER BY tm.created_at ASC
  `;

  return members.map((member: any) => ({
    id: member.id,
    teamId: member.team_id,
    userId: member.user_id,
    role: member.role,
    createdAt: member.created_at,
    teamName: member.team_name,
    teamSlug: member.team_slug,
    userName: member.user_name,
    userEmail: member.user_email,
  }));
}

export async function createTeam(name: string, createdBy: string, slug?: string): Promise<Team> {
  let finalSlug = slug;
  
  if (!finalSlug) {
    // Generate slug from name using the database function
    const [result] = await sql`SELECT generate_team_slug(${name}) as slug`;
    finalSlug = result.slug;
  }

  const [team] = await sql`
    INSERT INTO teams (name, slug, created_by)
    VALUES (${name}, ${finalSlug}, ${createdBy})
    RETURNING id, name, slug, created_by, created_at
  `;

  await addTeamMember(team.id, createdBy, TeamRole.ADMIN);

  return {
    id: team.id,
    name: team.name,
    slug: team.slug,
    createdBy: team.created_by,
    createdAt: team.created_at,
  };
}

export async function addTeamMember(teamId: string, userId: string, role: TeamRole = TeamRole.USER): Promise<TeamMember> {
  const [member] = await sql`
    INSERT INTO team_members (team_id, user_id, role)
    VALUES (${teamId}, ${userId}, ${role})
    ON CONFLICT (team_id, user_id) DO UPDATE SET role = ${role}
    RETURNING id, team_id, user_id, role, created_at
  `;

  return {
    id: member.id,
    teamId: member.team_id,
    userId: member.user_id,
    role: member.role,
    createdAt: member.created_at,
  };
}

export async function removeTeamMember(teamId: string, userId: string): Promise<void> {
  await sql`
    DELETE FROM team_members
    WHERE team_id = ${teamId} AND user_id = ${userId}
  `;
}

export async function updateTeamMemberRole(teamId: string, userId: string, role: TeamRole): Promise<TeamMember> {
  const [member] = await sql`
    UPDATE team_members
    SET role = ${role}
    WHERE team_id = ${teamId} AND user_id = ${userId}
    RETURNING id, team_id, user_id, role, created_at
  `;

  return {
    id: member.id,
    teamId: member.team_id,
    userId: member.user_id,
    role: member.role,
    createdAt: member.created_at,
  };
}

export async function userHasTeamAccess(userId: string, teamId: string): Promise<boolean> {
  const [result] = await sql`
    SELECT 1
    FROM team_members
    WHERE user_id = ${userId} AND team_id = ${teamId}
    LIMIT 1
  `;

  return !!result;
}

export async function userIsTeamAdmin(userId: string, teamId: string): Promise<boolean> {
  const [result] = await sql`
    SELECT 1
    FROM team_members
    WHERE user_id = ${userId} AND team_id = ${teamId} AND role = 'ADMIN'
    LIMIT 1
  `;

  return !!result;
}

export async function getTeamAgents(teamId: string): Promise<any[]> {
  return sql`
    SELECT id, name, website_domain, model, team_id, created_by, created_at
    FROM agents
    WHERE team_id = ${teamId}
    ORDER BY created_at DESC
  `;
}

export async function deleteTeam(teamId: string): Promise<void> {
  await sql`
    DELETE FROM teams
    WHERE id = ${teamId}
  `;
}

export async function updateTeam(teamId: string, name: string, slug?: string): Promise<Team> {
  let finalSlug = slug;
  
  if (!finalSlug) {
    // Generate new slug from name
    const [result] = await sql`SELECT generate_team_slug(${name}) as slug`;
    finalSlug = result.slug;
  }

  const [team] = await sql`
    UPDATE teams
    SET name = ${name}, slug = ${finalSlug}
    WHERE id = ${teamId}
    RETURNING id, name, slug, created_by, created_at
  `;

  return {
    id: team.id,
    name: team.name,
    slug: team.slug,
    createdBy: team.created_by,
    createdAt: team.created_at,
  };
}

export async function createTeamInvitation(teamId: string, email: string, role: TeamRole, invitedBy: string): Promise<any> {
  const [invitation] = await sql`
    INSERT INTO team_invitations (team_id, email, role, invited_by)
    VALUES (${teamId}, ${email}, ${role}, ${invitedBy})
    RETURNING id, team_id, email, role, invited_by, expires_at, created_at
  `;

  return {
    id: invitation.id,
    teamId: invitation.team_id,
    email: invitation.email,
    role: invitation.role,
    invitedBy: invitation.invited_by,
    expiresAt: invitation.expires_at,
    createdAt: invitation.created_at,
  };
}

export async function getTeamInvitations(teamId: string): Promise<any[]> {
  const invitations = await sql`
    SELECT 
      ti.id,
      ti.team_id,
      ti.email,
      ti.role,
      ti.invited_by,
      ti.expires_at,
      ti.created_at,
      u.name as invited_by_name,
      u.email as invited_by_email
    FROM team_invitations ti
    JOIN next_auth.users u ON ti.invited_by = u.id
    WHERE ti.team_id = ${teamId} AND ti.expires_at > NOW()
    ORDER BY ti.created_at DESC
  `;

  return invitations.map((invitation: any) => ({
    id: invitation.id,
    teamId: invitation.team_id,
    email: invitation.email,
    role: invitation.role,
    invitedBy: invitation.invited_by,
    invitedByName: invitation.invited_by_name,
    invitedByEmail: invitation.invited_by_email,
    expiresAt: invitation.expires_at,
    createdAt: invitation.created_at,
  }));
}

export async function acceptTeamInvitation(invitationId: string, userId: string): Promise<TeamMember> {
  // Get the invitation
  const [invitation] = await sql`
    SELECT team_id, email, role
    FROM team_invitations
    WHERE id = ${invitationId} AND expires_at > NOW()
    LIMIT 1
  `;

  if (!invitation) {
    throw new Error('Invitation not found or expired');
  }

  // Verify the user's email matches the invitation
  const [user] = await sql`
    SELECT email
    FROM next_auth.users
    WHERE id = ${userId}
    LIMIT 1
  `;

  if (!user || user.email !== invitation.email) {
    throw new Error('Email does not match invitation');
  }

  // Add the user to the team
  const member = await addTeamMember(invitation.team_id, userId, invitation.role);

  // Delete the invitation
  await sql`
    DELETE FROM team_invitations
    WHERE id = ${invitationId}
  `;

  return member;
}

export async function deleteTeamInvitation(invitationId: string, teamId: string, userId: string): Promise<void> {
  // Check if user is admin of the team
  const isAdmin = await userIsTeamAdmin(userId, teamId);
  if (!isAdmin) {
    throw new Error('Only team admins can delete invitations');
  }

  await sql`
    DELETE FROM team_invitations
    WHERE id = ${invitationId} AND team_id = ${teamId}
  `;
} 