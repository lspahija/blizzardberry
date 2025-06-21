# Team System Implementation

This document describes the team system implementation for the Omni Interface application.

## Overview

The team system allows users to:
- Create multiple teams
- Invite team members with different roles (ADMIN, USER)
- Share agents within teams
- Manage team access and permissions

## Database Schema

### Tables

#### `teams`
- `id` (UUID, Primary Key)
- `name` (TEXT, NOT NULL, UNIQUE)
- `slug` (TEXT, NOT NULL, UNIQUE) - Auto-generated from name
- `created_by` (UUID, Foreign Key to next_auth.users)
- `created_at` (TIMESTAMP WITH TIME ZONE)

#### `team_members`
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key to teams)
- `user_id` (UUID, Foreign Key to next_auth.users)
- `role` (ENUM: 'ADMIN', 'USER')
- `created_at` (TIMESTAMP WITH TIME ZONE)
- Unique constraint on (team_id, user_id)

#### `agents` (Updated)
- `id` (UUID, Primary Key)
- `name` (TEXT, NOT NULL)
- `website_domain` (TEXT, NOT NULL)
- `model` (TEXT, NOT NULL)
- `team_id` (UUID, Foreign Key to teams) - **NEW FIELD**
- `created_by` (UUID, Foreign Key to next_auth.users)
- `created_at` (TIMESTAMP WITH TIME ZONE)

### Functions

#### `generate_team_slug(user_name TEXT)`
Automatically generates unique team slugs from user names:
- Converts name to lowercase
- Replaces spaces with hyphens
- Removes special characters
- Adds "-team" suffix
- Appends number if slug already exists (e.g., "john-smith-team_1")

#### `create_default_team_for_user()`
Trigger function that automatically creates a default team when a new user is created:
- Generates team name: "{User's Name}'s Team"
- Creates unique slug using `generate_team_slug()`
- Adds user as ADMIN of their own team

### Helper Functions

- `get_user_teams(user_uuid UUID)` - Get all teams for a user with roles
- `user_has_team_access(user_uuid UUID, team_uuid UUID)` - Check team access
- `user_is_team_admin(user_uuid UUID, team_uuid UUID)` - Check admin status

## API Endpoints

### Teams

#### `GET /api/teams`
Get all teams for the authenticated user with roles.

**Response:**
```json
{
  "teams": [
    {
      "id": "uuid",
      "name": "Team Name",
      "slug": "team-slug",
      "createdBy": "user-uuid",
      "createdAt": "2024-01-01T00:00:00Z",
      "role": "ADMIN",
      "isAdmin": true
    }
  ]
}
```

#### `POST /api/teams`
Create a new team.

**Request:**
```json
{
  "name": "Team Name",
  "slug": "optional-custom-slug"
}
```

#### `GET /api/teams/{teamId}`
Get team details with members and agents.

#### `PUT /api/teams/{teamId}`
Update team (admin only).

#### `DELETE /api/teams/{teamId}`
Delete team (admin only).

### Team Members

#### `GET /api/teams/{teamId}/members`
Get team members.

#### `POST /api/teams/{teamId}/members`
Add team member (admin only).

**Request:**
```json
{
  "userId": "user-uuid",
  "role": "USER"
}
```

#### `PUT /api/teams/{teamId}/members/{userId}`
Update member role (admin only).

#### `DELETE /api/teams/{teamId}/members/{userId}`
Remove team member (admin only).

### Agents (Updated)

#### `GET /api/agents`
Get all agents accessible to the user through team membership.

#### `POST /api/agents`
Create agent (requires teamId).

**Request:**
```json
{
  "name": "Agent Name",
  "websiteDomain": "example.com",
  "model": "openai/gpt-4o",
  "teamId": "team-uuid"
}
```

## TypeScript Interfaces

### Team Types
```typescript
interface Team {
  id: string;
  name: string;
  slug: string;
  createdBy: string;
  createdAt: string;
}

interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  createdAt: string;
}

enum TeamRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}
```

### Updated Agent Interface
```typescript
interface Agent {
  id: string;
  name: string;
  websiteDomain: string;
  model: AgentModel;
  teamId: string; // NEW FIELD
  createdBy: string;
  createdAt: string;
}
```

## React Hooks

### `useTeams()`
Hook for team management:
```typescript
const {
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
} = useTeams();
```

### `useAgents()` (Updated)
Hook for agent management (now requires teamId):
```typescript
const {
  agents,
  loading,
  error,
  fetchAgents,
  createAgent, // Now requires teamId parameter
  updateAgent,
  deleteAgent,
} = useAgents();
```

## Usage Examples

### Creating a Team
```typescript
const { createTeam } = useTeams();
const newTeam = await createTeam({ name: "My New Team" });
```

### Adding a Team Member
```typescript
const { addTeamMember } = useTeams();
await addTeamMember({
  teamId: "team-uuid",
  userId: "user-uuid",
  role: TeamRole.USER
});
```

### Creating an Agent in a Team
```typescript
const { createAgent } = useAgents();
const agentId = await createAgent({
  name: "My Agent",
  websiteDomain: "example.com",
  model: "openai/gpt-4o",
  teamId: "team-uuid"
});
```

## Migration Notes

### For Existing Users
- Existing users will automatically get a default team created via the trigger
- Team name: "{User's Name}'s Team"
- User is automatically added as ADMIN

### For Existing Agents
- Existing agents need to be migrated to have a team_id
- You may need to create a migration script to assign existing agents to users' default teams

## Security Considerations

- Team access is controlled through team membership
- Only team admins can modify team settings
- Only team admins can add/remove members
- Users can only access agents within teams they belong to
- CASCADE deletes ensure data consistency when teams are deleted

## Future Enhancements

- Team invitations via email
- Team billing and usage tracking
- Team templates and presets
- Advanced permission system (read-only, write, etc.)
- Team activity logs 