import { supabaseClient } from '@/app/api/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-embedding-exp-03-07' });

export async function embedText(text: string): Promise<number[]> {
  const result = await model.embedContent({
    content: {
      role: "user",
      parts: [{ text }],
    },
  });

  const vector = result.embedding?.values;

  if (!vector || vector.length !== 3072) {
    throw new Error('Invalid Gemini embedding');
  }

  return vector;
}

export async function embedTextBatch(texts: string[]): Promise<number[][]> {
  const requests = texts.map(text => ({
    content: {
      role: 'user',
      parts: [{ text }],
    },
  }));

  const result = await model.batchEmbedContents({ requests });

  return result.embeddings.map(e => e.values);
}

export async function similaritySearch(
  query: string,
  k: number,
  chatbotId: string
) {
  const embedding = await embedText(query);

  const { data, error } = await supabaseClient.rpc('search_documents', {
    query_embedding: embedding,
    match_count: k,
    filter: { chatbotId },
  });

  if (error) {
    console.error('Similarity search error:', error);
    throw new Error(error.message);
  }

  return data.reduce((acc: Record<string, any[]>, row: any) => {
    const parentId = row.metadata?.parent_document_id || 'no_parent';
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