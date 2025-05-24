import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { supabaseClient } from '@/app/api/lib/supabase';

//TODO: further optimizations: https://supabase.com/docs/guides/ai/langchain
export const vectorStore = new SupabaseVectorStore(
  new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-embedding-exp-03-07',
  }),
  {
    client: supabaseClient,
    tableName: 'documents',
    queryName: 'search_documents',
  }
);

export async function similaritySearch(query: string, k: number) {
  // Perform similarity search with score
  const resultsWithScore = await vectorStore.similaritySearchWithScore(
    query,
    k
  );

  // Group results by parent_document_id
  const groupedResults = resultsWithScore.reduce(
    (acc: Record<string, any[]>, [doc, score]) => {
      const parentId = doc.metadata.parent_document_id || 'no_parent';
      if (!acc[parentId]) {
        acc[parentId] = [];
      }
      acc[parentId].push({
        id: doc.metadata.id || doc.metadata.document_id || 'unknown', // Fallback ID
        parent_document_id: doc.metadata.parent_document_id,
        content: doc.pageContent,
        metadata: doc.metadata,
        similarity: score, // Use score from similaritySearchWithScore
      });
      return acc;
    },
    {}
  );

  return groupedResults;
}
