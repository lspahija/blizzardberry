import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { 
  updateTeamMemberRole, 
  removeTeamMember, 
  userIsTeamAdmin
} from '@/app/api/lib/store/teamStore';
import { TeamRole } from '@/app/api/lib/model/team/team';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ teamId: string; userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId, userId } = await params;
    const { role } = await req.json();

    // Check if user is admin of the team
    const isAdmin = await userIsTeamAdmin(session.user.id, teamId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only team admins can update member roles' },
        { status: 403 }
      );
    }

    // Validate role
    if (!Object.values(TeamRole).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const member = await updateTeamMemberRole(teamId, userId, role as TeamRole);

    return NextResponse.json({ member }, { status: 200 });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ teamId: string; userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId, userId } = await params;

    // Check if user is admin of the team
    const isAdmin = await userIsTeamAdmin(session.user.id, teamId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only team admins can remove members' },
        { status: 403 }
      );
    }

    // Prevent removing yourself from the team
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot remove yourself from the team' },
        { status: 400 }
      );
    }

    await removeTeamMember(teamId, userId);

    return NextResponse.json({ message: 'Member removed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
} 