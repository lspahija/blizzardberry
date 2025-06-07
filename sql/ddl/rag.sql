CREATE TABLE documents
(
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content   TEXT NOT NULL,
    metadata  JSONB,
    embedding HALFVEC(1024),
    parent_document_id UUID NOT NULL,
    chatbot_id UUID NOT NULL REFERENCES chatbots (id) ON DELETE CASCADE
);

CREATE INDEX documents_embedding_idx ON documents USING hnsw (embedding halfvec_cosine_ops);
CREATE INDEX documents_chatbot_id_idx ON documents (chatbot_id);
CREATE INDEX documents_parent_document_id_idx ON documents (parent_document_id);

CREATE OR REPLACE FUNCTION search_documents(p_chatbot_id UUID, match_count INTEGER, query_embedding HALFVEC(1024), filter JSONB DEFAULT NULL)
    RETURNS TABLE
            (
                id         UUID,
                content    TEXT,
                metadata   JSONB,
                similarity FLOAT
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT d.id,
               d.content,
               d.metadata,
               (1 - (d.embedding <-> query_embedding)) AS similarity
        FROM documents d
        WHERE (chatbot_id IS NULL OR d.chatbot_id = p_chatbot_id)
          AND (filter IS NULL OR d.metadata @> filter)
        ORDER BY d.embedding <-> query_embedding
        LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
