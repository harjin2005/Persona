-- Enable pgvector extension
create extension if not exists vector;

-- Documents table for RAG
create table if not exists documents (
  id bigserial primary key,
  content text not null,
  embedding vector(1536),
  source text not null,
  chunk_index int not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- IVFFlat index for cosine similarity search
create index if not exists documents_embedding_idx
  on documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Match function used by the RAG retrieval API
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float default 0.65,
  match_count int default 5
)
returns table (
  id bigint,
  content text,
  source text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    documents.source,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;
