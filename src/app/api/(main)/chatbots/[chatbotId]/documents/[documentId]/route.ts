import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { chatbotAuth } from '@/app/api/lib/auth/chatbotAuth';
import { deleteAllChunks } from '@/app/api/lib/store/documentStore';

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ chatbotId: string; documentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatbotId, documentId } = await params;

    const authResponse = await chatbotAuth(session.user.id, chatbotId);
    if (authResponse) return authResponse;

    const deleteError = await deleteAllChunks(documentId, chatbotId);

    if (deleteError) {
      throw new Error(
        `Failed to delete document chunks: ${deleteError.message}`
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
