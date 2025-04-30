create table actions (
                         id uuid default uuid_generate_v4() primary key,
                         name text not null unique,
                         description text not null,
                         http_model jsonb not null,
                         created_at timestamp with time zone default now()
);

DROP TABLE IF EXISTS documents;
DROP FUNCTION IF EXISTS search_documents;


CREATE TABLE documents (
                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           content TEXT NOT NULL,
                           metadata JSONB,
                           embedding HALFVEC(3072)
);


CREATE INDEX documents_embedding_idx ON documents USING hnsw (embedding halfvec_cosine_ops);


CREATE OR REPLACE FUNCTION search_documents(query_embedding HALFVEC(3072), top_k INTEGER)
    RETURNS TABLE (
                      id UUID,
                      content TEXT,
                      metadata JSONB,
                      similarity FLOAT
                  ) AS $$
BEGIN
    RETURN QUERY
        SELECT
            d.id,
            d.content,
            d.metadata,
            (1 - (d.embedding <-> query_embedding)) AS similarity
        FROM documents d
        ORDER BY d.embedding <-> query_embedding
        LIMIT top_k;
END;
$$ LANGUAGE plpgsql;