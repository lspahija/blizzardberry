import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { chatbotAuth } from '@/app/api/lib/auth/chatbotAuth';
import { createDocuments } from '@/app/api/lib/store/documentStore';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, metadata, chatbotId } = await request.json();
    const authResponse = await chatbotAuth(session.user.id, chatbotId);
    if (authResponse) return authResponse;

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
          parentDocumentId: doc.metadata.parent_document_id,
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
