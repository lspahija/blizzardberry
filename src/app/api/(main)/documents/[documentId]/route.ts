import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { chatbotAuth } from '@/app/api/lib/chatbotAuth';
import { supabaseClient } from '@/app/api/lib/supabase';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId } = await params;

    // First check if the document exists
    const { data: documents, error: fetchError } = await supabaseClient
      .from('documents')
      .select('*')
      .or(`id.eq.${documentId},metadata->>'parent_document_id'.eq.${documentId}`);

    if (fetchError) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (!documents || documents.length === 0) {
      // If no documents found, try to find by parent_document_id in metadata
      const { data: parentDocs } = await supabaseClient
        .from('documents')
        .select('*')
        .eq('metadata->>parent_document_id', documentId);

      if (!parentDocs || parentDocs.length === 0) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }

      // Use the first parent document to check chatbot ownership
      const document = parentDocs[0];
      const chatbotId = document.metadata?.chatbot_id;
      if (!chatbotId) {
        throw new Error('Document has no associated chatbot');
      }

      const authResponse = await chatbotAuth(session.user.id, chatbotId);
      if (authResponse) return authResponse;

      // Delete all chunks with this parent_document_id
      const { error: deleteError } = await supabaseClient
        .from('documents')
        .delete()
        .eq('metadata->>parent_document_id', documentId);

      if (deleteError) {
        throw new Error(`Failed to delete document chunks: ${deleteError.message}`);
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Get the first document to check chatbot ownership
    const document = documents[0];
    const chatbotId = document.metadata?.chatbot_id;
    if (!chatbotId) {
      throw new Error('Document has no associated chatbot');
    }

    const authResponse = await chatbotAuth(session.user.id, chatbotId);
    if (authResponse) return authResponse;

    // Delete all chunks of the document
    const { error: deleteError } = await supabaseClient
      .from('documents')
      .delete()
      .or(`id.eq.${documentId},metadata->>'parent_document_id'.eq.${documentId}`);

    if (deleteError) {
      throw new Error(`Failed to delete document: ${deleteError.message}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
} 