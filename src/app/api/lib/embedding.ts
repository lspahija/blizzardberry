import { GoogleGenerativeAI } from '@google/generative-ai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-embedding-exp-03-07' });

export async function embedText(text: string): Promise<number[]> {
  const result = await model.embedContent({
    content: {
      role: 'user',
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
  const requests = texts.map((text) => ({
    content: {
      role: 'user',
      parts: [{ text }],
    },
  }));

  const result = await model.batchEmbedContents({ requests });

  return result.embeddings.map((e) => e.values);
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
