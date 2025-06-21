import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getUserTeamsWithRoles, createTeam } from '@/app/api/lib/store/teamStore';
import { TeamRole } from '@/app/api/lib/model/team/team';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teams = await getUserTeamsWithRoles(session.user.id);

    return NextResponse.json({ teams }, { status: 200 });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, slug } = await req.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      );
    }

    const team = await createTeam(name, session.user.id, slug);

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
} 