import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { supabaseClient } from '@/app/api/lib/supabase';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { auth } from '@/lib/auth/auth';
import { chatbotAuth } from '@/app/api/lib/chatbotAuth';
import { embedTextBatch } from '@/app/api/lib/embedding';

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
    const chunks = await textSplitter.splitText(cleanedText);

    const validChunks = chunks
      .map((chunk, index) => ({ chunk, index }))
      .filter(({ chunk }) => chunk.trim().length > 0);

    const chunkTexts = validChunks.map(({ chunk }) => chunk);

    const vectors = await embedTextBatch(chunkTexts);

    const documentsToInsert = validChunks.map(({ chunk, index }, i) => ({
      id: uuidv4(),
      content: chunk,
      embedding: vectors[i],
      metadata: {
        ...metadata,
        chunk_index: index,
        parent_document_id: parentId,
        chatbot_id: chatbotId,
      },
    }));

    const { error } = await supabaseClient.from('documents').insert(documentsToInsert);

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json(
        { error: 'Failed to store documents in Supabase' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      documents: documentsToInsert.map(doc => ({
        id: doc.id,
        parent_document_id: doc.metadata.parent_document_id,
        content: doc.content,
        metadata: doc.metadata,
      })),
    }, { status: 201 });

  } catch (error) {
    console.error('Storage error:', error);
    return NextResponse.json(
      { error: 'Failed to store documents' },
      { status: 500 }
    );
  }
}

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
  separators: ['\n\n', '\n', '.', '!', '?', ',', ' ', ''],
});

const cleanText = (text: string): string =>
  text
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E\n]/g, '')
    .trim();
