import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { chatbotAuth } from '@/app/api/lib/auth/chatbotAuth';
import { supabaseClient } from '@/app/api/lib/store/supabase';

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

    // Delete all chunks with this parent_document_id
    const { error: deleteError } = await supabaseClient
      .from('documents')
      .delete()
      .eq('parent_document_id', documentId)
      .eq('chatbot_id', chatbotId);

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
