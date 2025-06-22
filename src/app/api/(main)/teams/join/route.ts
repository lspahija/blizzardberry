import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { 
  getTeamBySlug, 
  addTeamMember, 
  userHasTeamAccess
} from '@/app/api/lib/store/teamStore';
import { TeamRole } from '@/app/api/lib/model/team/team';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await req.json();

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Team slug is required' },
        { status: 400 }
      );
    }

    // Find team by slug
    const team = await getTeamBySlug(slug);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const isAlreadyMember = await userHasTeamAccess(session.user.id, team.id);
    if (isAlreadyMember) {
      return NextResponse.json(
        { error: 'You are already a member of this team' },
        { status: 400 }
      );
    }

    // Add user to team as a regular member
    const member = await addTeamMember(team.id, session.user.id, TeamRole.USER);

    return NextResponse.json({ 
      message: 'Successfully joined team',
      team,
      member 
    }, { status: 200 });
  } catch (error) {
    console.error('Error joining team:', error);
    return NextResponse.json(
      { error: 'Failed to join team' },
      { status: 500 }
    );
  }
} 