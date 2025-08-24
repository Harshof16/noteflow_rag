import { loadVectorStore } from "@/lib/retreiving/vectorStore";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

const SYSTEM_PROMPT = `You are an AI assistant helping users understand their uploaded documents.

Instructions:
- Answer ONLY based on the provided context from the documents
- Be specific and reference relevant information from the context
- If the context doesn't contain enough information, say so clearly
- Provide accurate, helpful responses

Context from Documents:
{context}

User Question: {question}

Answer:`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, query } = body;
    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // 1. Load vector store
    const vectorStore = await loadVectorStore();

    // 2. Search only inside selected notebook
    const results = await vectorStore.similaritySearch(query, 4);

    const context = results.map((r) => r.pageContent).join("\n\n");

    // Collect sources (unique)
    const sources = [...new Set(results.map((r) => r.metadata?.source))];

    // 3. Call OpenAI chat
    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await llm.invoke([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: `Context:\n${context}` },
      ...(messages || []),
      { role: "user", content: query },
    ]);

    return NextResponse.json({
    message: {
      id: uuid(),
      role: "assistant",
      content: `${completion.content}`,
      timestamp: Date.now(),
      sources, // from results.map(r => r.metadata.source)
    },
  },
{status: 200})

    // return NextResponse.json({ answer: completion.content }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching chat" }, { status: 400 });
  }
}
