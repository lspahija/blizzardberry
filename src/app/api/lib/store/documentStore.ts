import { v4 as uuidv4 } from 'uuid';
import { supabaseClient } from '@/app/api/lib/store/supabase';
import {
  cleanAndChunk,
  embedText,
  embedTextBatch,
} from '@/app/api/lib/embedding';

export async function createDocuments(
  text: string,
  metadata: any,
  chatbotId: string
) {
  const chunks = await cleanAndChunk(text);

  const validChunks = chunks
    .map((chunk, index) => ({ chunk, index }))
    .filter(({ chunk }) => chunk.trim().length > 0);

  const chunkTexts = validChunks.map(({ chunk }) => chunk);

  const vectors = await embedTextBatch(chunkTexts);

  const parentId = uuidv4();

  const documentsToInsert = validChunks.map(({ chunk, index }, i) => ({
    id: uuidv4(),
    content: chunk,
    embedding: vectors[i],
    metadata: {
      ...metadata,
      chunk_index: index,
    },
    parent_document_id: parentId,
    chatbot_id: chatbotId,
  }));

  const { error } = await supabaseClient
    .from('documents')
    .insert(documentsToInsert);

  return { error, documents: documentsToInsert };
}

export async function similaritySearch(
  query: string,
  k: number,
  chatbotId: string
) {
  const embedding = await embedText(query);

  const { data, error } = await supabaseClient.rpc('search_documents', {
    p_chatbot_id: chatbotId,
    match_count: k,
    query_embedding: embedding,
  });

  if (error) {
    console.error('Similarity search error:', error);
    throw new Error(error.message);
  }

  return data.reduce((acc: Record<string, any[]>, row: any) => {
    const parentId = row.parent_document_id;
    if (!acc[parentId]) acc[parentId] = [];
    acc[parentId].push({
      id: row.id,
      content: row.content,
      metadata: row.metadata,
      similarity: row.similarity,
      parent_document_id: parentId,
    });
    return acc;
  }, {});
}
