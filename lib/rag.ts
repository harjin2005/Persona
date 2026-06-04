import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function retrieveContext(query: string): Promise<string> {
  const embResp = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const queryEmbedding = embResp.data[0].embedding;

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
