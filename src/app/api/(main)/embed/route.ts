import { NextResponse } from 'next/server';
import { Document } from '@langchain/core/documents';
import { v4 as uuidv4 } from 'uuid';
import { vectorStore } from '@/app/api/(main)/lib/embedding';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export async function POST(request: Request) {
  try {
    const { text, metadata } = await request.json();

    // Clean text
    const cleanedText = cleanText(text);

    // Create a LangChain Document
    const parentId = uuidv4();
    const doc = new Document({
      pageContent: cleanedText,
      metadata: { ...metadata, parent_document_id: parentId },
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

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
    .trim();
}
