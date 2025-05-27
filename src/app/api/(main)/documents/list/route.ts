import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { chatbotAuth } from '@/app/api/lib/chatbotAuth';
import { supabaseClient } from '@/app/api/lib/supabase';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatbotId } = await req.json();

    const authResponse = await chatbotAuth(session.user.id, chatbotId);
    if (authResponse) return authResponse;

    // Fetch all documents for the given chatbot_id
    const { data, error } = await supabaseClient
      .from('documents')
      .select('id, content, metadata')
      .eq('metadata->>chatbot_id', chatbotId);

    if (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      console.warn(`No documents found for chatbot_id: ${chatbotId}`);
      return NextResponse.json({ documents: [] }, { status: 200 });
    }

    // Group and merge documents by metadata->>parent_document_id
    const mergedDocuments = Object.values(
      data.reduce((acc: Record<string, any>, doc: any) => {
        const parentId =
          doc.metadata?.parent_document_id || 'no_parent_' + doc.id;
        if (!acc[parentId]) {
          acc[parentId] = {
            id: parentId,
            parent_document_id: doc.metadata?.parent_document_id || null,
            content: [],
            metadata: doc.metadata,
            chunk_ids: [],
          };
        }
        acc[parentId].content.push(doc.content);
        acc[parentId].chunk_ids.push(doc.id);
        return acc;
      }, {})
    ).map((doc: any) => ({
      id: doc.id,
      parent_document_id: doc.parent_document_id,
      content: doc.content.join('\n'), // Merge content chunks with newlines
      metadata: doc.metadata,
      chunk_ids: doc.chunk_ids,
    }));

    return NextResponse.json({ documents: mergedDocuments }, { status: 200 });
  } catch (error) {
    console.error('Error in document list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents', details: error.message },
      { status: 500 }
    );
  }
}
