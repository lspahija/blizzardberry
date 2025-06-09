import { CohereClient } from 'cohere-ai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY!,
});

export async function embedText(text: string): Promise<number[]> {
  const response = await cohere.embed({
    texts: [text],
    model: 'embed-v4.0',
    inputType: 'search_query',
  });

  const vector = response.embeddings[0];

  if (!vector || vector.length !== 1536) {
    throw new Error('Invalid Cohere embedding');
  }

  return vector;
}

export async function embedTextBatch(texts: string[]): Promise<number[][]> {
  const response = await cohere.embed({
    texts: texts,
    model: 'embed-v4.0',
    inputType: 'search_document',
  });

  return response.embeddings as number[][];
}

export async function cleanAndChunk(text: string) {
  const cleanedText = cleanText(text);
  return await textSplitter.splitText(cleanedText);
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
