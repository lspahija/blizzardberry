import {GoogleGenerativeAIEmbeddings} from "@langchain/google-genai";
import {SupabaseVectorStore} from "@langchain/community/vectorstores/supabase";
import {supabaseClient} from "@/app/api/(main)/lib/Supabase";


//TODO: further optimizations: https://supabase.com/docs/guides/ai/langchain
// or maybe switch to llamaindex instead of langchain: https://supabase.com/docs/guides/ai/integrations/llamaindex

export const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-embedding-exp-03-07",
});

export const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabaseClient,
    tableName: "documents",
    queryName: "search_documents",
});