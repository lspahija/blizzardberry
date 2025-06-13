import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { agentAuth } from '@/app/api/lib/auth/agentAuth';
import { deleteAllChunks } from '@/app/api/lib/store/documentStore';

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ agentId: string; documentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId, documentId } = await params;

    const authResponse = await agentAuth(session.user.id, agentId);
    if (authResponse) return authResponse;

    await deleteAllChunks(documentId, agentId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
