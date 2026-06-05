import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function embedQuery(text: string): Promise<number[]> {
  const key = process.env.GEMINI_API_KEY!;
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text }] },
        taskType: "RETRIEVAL_QUERY",
      }),
    }
  );
  if (!resp.ok) throw new Error(`Gemini embed error: ${resp.status}`);
  const json = await resp.json();
  return json.embedding.values;
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
