import os
from openai import OpenAI
from supabase import create_client

oai = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
sb = create_client(
    os.environ["NEXT_PUBLIC_SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)

EMBED_MODEL = "text-embedding-3-small"
BATCH_SIZE = 20


def embed_and_store(chunks: list[dict]) -> int:
    stored = 0
    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i : i + BATCH_SIZE]
        texts = [c["content"] for c in batch]
        resp = oai.embeddings.create(model=EMBED_MODEL, input=texts)
        rows = []
        for j, chunk in enumerate(batch):
            rows.append({
                "content": chunk["content"],
                "embedding": resp.data[j].embedding,
                "source": chunk["source"],
                "chunk_index": chunk["chunk_index"],
                "metadata": chunk.get("metadata", {}),
            })
        sb.table("documents").insert(rows).execute()
        stored += len(rows)
        print(f"  Stored {stored}/{len(chunks)} chunks...")
    return stored
