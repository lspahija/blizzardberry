import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { chatbotAuth } from '@/app/api/lib/auth/chatbotAuth';
import {
  createDocuments,
  getDocuments,
} from '@/app/api/lib/store/documentStore';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ chatbotId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatbotId } = await params;

    const authResponse = await chatbotAuth(session.user.id, chatbotId);
    if (authResponse) return authResponse;

    const { data, error } = await getDocuments(chatbotId);

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
        const parentId = doc.parent_document_id;
        if (!acc[parentId]) {
          acc[parentId] = {
            id: parentId,
            parent_document_id: doc.parent_document_id,
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatbotId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatbotId } = await params;

    const authResponse = await chatbotAuth(session.user.id, chatbotId);
    if (authResponse) return authResponse;

    const { text, metadata } = await request.json();

    const { error, documents } = await createDocuments(
      text,
      metadata,
      chatbotId
    );

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json(
        { error: 'Failed to store documents in Supabase' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        documents: documents.map((doc) => ({
          id: doc.id,
          parentDocumentId: doc.parent_document_id,
          content: doc.content,
          metadata: doc.metadata,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Storage error:', error);
    return NextResponse.json(
      { error: 'Failed to store documents' },
      { status: 500 }
    );
  }
}
