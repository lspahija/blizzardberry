CREATE TABLE documents
(
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content   TEXT NOT NULL,
    metadata  JSONB,
    embedding HALFVEC(1536),
    parent_document_id UUID NOT NULL,
    agent_id UUID NOT NULL REFERENCES agents (id) ON DELETE CASCADE
);

-- Essential indexes for document queries
CREATE INDEX documents_agent_id_idx ON documents (agent_id);
-- Vector similarity index (keep existing HNSW)
CREATE INDEX documents_embedding_idx ON documents USING hnsw (embedding halfvec_cosine_ops);
-- Parent document relationship index
CREATE INDEX documents_parent_document_id_idx ON documents (parent_document_id);
-- Composite index for agent-based document management
CREATE INDEX documents_agent_parent_idx ON documents (agent_id, parent_document_id);
-- JSONB metadata index (if metadata queries are needed)
CREATE INDEX documents_metadata_idx ON documents USING GIN (metadata);

CREATE OR REPLACE FUNCTION search_documents(p_agent_id UUID, match_count INTEGER, query_embedding HALFVEC(1536), filter JSONB DEFAULT NULL)
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
        WHERE (agent_id IS NULL OR d.agent_id = p_agent_id)
          AND (filter IS NULL OR d.metadata @> filter)
        ORDER BY d.embedding <-> query_embedding
        LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
