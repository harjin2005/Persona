import os
import requests
from supabase import create_client

COHERE_API_KEY = os.environ["COHERE_API_KEY"]
sb = create_client(
    os.environ["NEXT_PUBLIC_SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)

BATCH_SIZE = 20


def embed_texts(texts: list[str]) -> list[list[float]]:
    resp = requests.post(
        "https://api.cohere.com/v2/embed",
        headers={
            "Authorization": f"Bearer {COHERE_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "texts": texts,
            "model": "embed-english-v3.0",
            "input_type": "search_document",
            "embedding_types": ["float"],
        },
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["embeddings"]["float"]


def embed_and_store(chunks: list[dict]) -> int:
    stored = 0
    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i : i + BATCH_SIZE]
        texts = [c["content"] for c in batch]
        embeddings = embed_texts(texts)
        rows = []
        for j, chunk in enumerate(batch):
            rows.append({
                "content": chunk["content"],
                "embedding": embeddings[j],
                "source": chunk["source"],
                "chunk_index": chunk["chunk_index"],
                "metadata": chunk.get("metadata", {}),
            })
        sb.table("documents").insert(rows).execute()
        stored += len(rows)
        print(f"  Stored {stored}/{len(chunks)} chunks...")
    return stored
