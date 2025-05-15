CREATE TYPE execution_context AS ENUM ('CLIENT', 'SERVER');

create table actions
(
    id          uuid                     default uuid_generate_v4() primary key,
    name        text  not null unique,
    description text  not null,
    execution_context execution_context not null,
    execution_model  jsonb not null,
    created_at  timestamp with time zone default now()
);




CREATE TABLE documents
(
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_document_id UUID, -- Links chunks to parent document
    content            TEXT NOT NULL,
    metadata           JSONB,
    embedding          HALFVEC(3072)
);

CREATE INDEX documents_embedding_idx ON documents USING hnsw (embedding halfvec_cosine_ops);
CREATE INDEX documents_parent_id_idx ON documents (parent_document_id);

CREATE OR REPLACE FUNCTION search_documents(filter JSONB, match_count INTEGER, query_embedding HALFVEC(3072))
    RETURNS TABLE
            (
                id                 UUID,
                parent_document_id UUID,
                content            TEXT,
                metadata           JSONB,
                similarity         FLOAT
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT d.id,
               d.parent_document_id,
               d.content,
               d.metadata,
               (1 - (d.embedding <-> query_embedding)) AS similarity
        FROM documents d
        WHERE (filter IS NULL OR d.metadata @> filter)
        ORDER BY d.embedding <-> query_embedding
        LIMIT match_count;
END;
$$ LANGUAGE plpgsql;