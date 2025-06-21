import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { 
  getTeamMembers, 
  addTeamMember, 
  userIsTeamAdmin,
  userHasTeamAccess
} from '@/app/api/lib/store/teamStore';
import { TeamRole } from '@/app/api/lib/model/team/team';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = await params;

    // Check if user has access to the team
    const hasAccess = await userHasTeamAccess(session.user.id, teamId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const members = await getTeamMembers(teamId);

    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = await params;
    const { userId, role = 'USER' } = await req.json();

    // Check if user is admin of the team
    const isAdmin = await userIsTeamAdmin(session.user.id, teamId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only team admins can add members' },
        { status: 403 }
      );
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(TeamRole).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const member = await addTeamMember(teamId, userId, role as TeamRole);

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    );
  }
} 