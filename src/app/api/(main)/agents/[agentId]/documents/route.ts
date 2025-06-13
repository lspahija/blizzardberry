import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { agentAuth } from '@/app/api/lib/auth/agentAuth';
import {
  createDocuments,
  getDocuments,
} from '@/app/api/lib/store/documentStore';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId } = await params;

    const authResponse = await agentAuth(session.user.id, agentId);
    if (authResponse) return authResponse;

    const data = await getDocuments(agentId);

    if (!data || data.length === 0) {
      console.warn(`No documents found for agent_id: ${agentId}`);
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
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId } = await params;

    const authResponse = await agentAuth(session.user.id, agentId);
    if (authResponse) return authResponse;

    const { text, metadata } = await request.json();

    const documents = await createDocuments(text, metadata, agentId);

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
