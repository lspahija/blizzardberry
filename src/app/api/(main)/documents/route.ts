import { NextResponse } from 'next/server';
import { Document } from '@langchain/core/documents';
import { v4 as uuidv4 } from 'uuid';
import { vectorStore } from '@/app/api/lib/embedding';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { auth } from '@/lib/auth/auth';
import { chatbotAuth } from '@/app/api/lib/chatbotAuth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, metadata, chatbotId } = await request.json();

    const authResponse = await chatbotAuth(session.user.id, chatbotId);
    if (authResponse) return authResponse;

    const cleanedText = cleanText(text);

    const parentId = uuidv4();
    const doc = new Document({
      pageContent: cleanedText,
      metadata: {
        ...metadata,
        parent_document_id: parentId,
        chatbot_id: chatbotId,
      },
    });

    // Split into chunks
    const chunks = await textSplitter.splitDocuments([doc]);

    // Assign chunk-specific metadata
    const chunkDocs = chunks.map((chunk, index) => ({
      ...chunk,
      metadata: {
        ...chunk.metadata,
        chunk_index: index,
        parent_document_id: parentId,
        chatbot_id: chatbotId,
      },
    }));

    // Store chunks in Supabase and get stored documents
    const storedDocs = await vectorStore.addDocuments(chunkDocs);

    // Format response to match original structure
    const responseDocs = chunkDocs.map((doc, index) => ({
      id: storedDocs[index] || uuidv4(),
      parent_document_id: doc.metadata.parent_document_id,
      content: doc.pageContent,
      metadata: doc.metadata,
    }));

    return NextResponse.json({ documents: responseDocs }, { status: 201 });
  } catch (error) {
    console.error('Storage error:', error);
    return NextResponse.json(
      { error: 'Failed to store documents' },
      { status: 500 }
    );
  }
}

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500, // ~500 characters per chunk
  chunkOverlap: 50, // 50-character overlap
  separators: ['\n\n', '\n', '.', '!', '?', ',', ' ', ''], // Natural boundaries
});

const cleanText = (text: string): string =>
  text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
    .trim();
