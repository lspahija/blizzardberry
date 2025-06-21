import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { 
  getTeam, 
  updateTeam, 
  deleteTeam, 
  userIsTeamAdmin,
  getTeamMembers,
  getTeamAgents
} from '@/app/api/lib/store/teamStore';

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
    const team = await getTeam(teamId);

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Get team members and agents
    const [members, agents] = await Promise.all([
      getTeamMembers(teamId),
      getTeamAgents(teamId)
    ]);

    return NextResponse.json({ 
      team, 
      members, 
      agents 
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = await params;
    const { name, slug } = await req.json();

    // Check if user is admin of the team
    const isAdmin = await userIsTeamAdmin(session.user.id, teamId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only team admins can update team settings' },
        { status: 403 }
      );
    }

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      );
    }

    const team = await updateTeam(teamId, name, slug);

    return NextResponse.json({ team }, { status: 200 });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = await params;

    // Check if user is admin of the team
    const isAdmin = await userIsTeamAdmin(session.user.id, teamId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only team admins can delete teams' },
        { status: 403 }
      );
    }

    await deleteTeam(teamId);

    return NextResponse.json({ message: 'Team deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    );
  }
} 