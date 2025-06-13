import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { agentAuth } from '@/app/api/lib/auth/agentAuth';
import { deleteAction } from '@/app/api/lib/store/actionStore';

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ agentId: string; actionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId, actionId } = await params;

    const authResponse = await agentAuth(session.user.id, agentId);
    if (authResponse) return authResponse;

    await deleteAction(actionId, agentId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting action:', error);
    return NextResponse.json(
      { error: 'Failed to delete action' },
      { status: 500 }
    );
  }
}
