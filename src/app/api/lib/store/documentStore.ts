import { v4 as uuidv4 } from 'uuid';
import sql from '@/app/api/lib/store/db';
import {
  cleanAndChunk,
  embedText,
  embedTextBatch,
} from '@/app/api/lib/embedding/embedding';

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
    embedding: `[${vectors[i].join(',')}]`, // Convert array to halfvec string format
    metadata: {
      ...metadata,
      chunk_index: index,
    },
    parent_document_id: parentId,
    chatbot_id: chatbotId,
  }));

  const documentAsArray = documentsToInsert.map((doc) => [
    doc.id,
    doc.content,
    doc.embedding,
    doc.metadata,
    doc.parent_document_id,
    doc.chatbot_id,
  ]);

  await sql`
    INSERT INTO documents (id, content, embedding, metadata, parent_document_id, chatbot_id) VALUES ${sql(documentAsArray)}
  `;

  return documentsToInsert;
}

export async function getDocuments(chatbotId: string) {
  return sql`
    SELECT id, content, metadata, parent_document_id
    FROM documents
    WHERE chatbot_id = ${chatbotId}
  `;
}

export async function deleteAllChunks(
  parentDocumentId: string,
  chatbotId: string
) {
  await sql`
      DELETE FROM documents
      WHERE parent_document_id = ${parentDocumentId} AND chatbot_id = ${chatbotId}
    `;
}

export async function similaritySearch(
  query: string,
  k: number,
  chatbotId: string
) {
  const embedding = await embedText(query);

  const data = await sql`
      SELECT * FROM search_documents(
        ${chatbotId},
        ${k},
        ${embedding}
      )
    `;

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
