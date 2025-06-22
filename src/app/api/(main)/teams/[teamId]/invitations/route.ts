import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { 
  getTeamInvitations, 
  createTeamInvitation, 
  userIsTeamAdmin
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
    const isAdmin = await userIsTeamAdmin(session.user.id, teamId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only team admins can view invitations' },
        { status: 403 }
      );
    }

    const invitations = await getTeamInvitations(teamId);

    return NextResponse.json({ invitations }, { status: 200 });
  } catch (error) {
    console.error('Error fetching team invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team invitations' },
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
    const { email, role = 'USER' } = await req.json();

    // Check if user is admin of the team
    const isAdmin = await userIsTeamAdmin(session.user.id, teamId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only team admins can send invitations' },
        { status: 403 }
      );
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
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

    const invitation = await createTeamInvitation(teamId, email, role as TeamRole, session.user.id);

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error('Error creating team invitation:', error);
    return NextResponse.json(
      { error: 'Failed to create team invitation' },
      { status: 500 }
    );
  }
} 