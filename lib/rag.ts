import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function embedQuery(text: string): Promise<number[]> {
  const resp = await fetch("https://api.cohere.com/v2/embed", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.COHERE_API_KEY!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      texts: [text],
      model: "embed-english-v3.0",
      input_type: "search_query",
      embedding_types: ["float"],
    }),
  });
  if (!resp.ok) throw new Error(`Cohere embed error: ${resp.status}`);
  const json = await resp.json();
  return json.embeddings.float[0];
}

export async function retrieveContext(query: string): Promise<string> {
  const queryEmbedding = await embedQuery(query);

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_threshold: 0.65,
    match_count: 5,
  });

  if (error || !data?.length) return "";

  return (data as Array<{ source: string; content: string }>)
    .map((doc) => `[Source: ${doc.source}]\n${doc.content}`)
    .join("\n\n---\n\n");
}
