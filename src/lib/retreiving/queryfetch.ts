import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { loadVectorStore } from "./vectorStore";

export const retreivingFromDb = async (query: string) => {
  const vectorStore = await loadVectorStore();
  const results = await vectorStore.similaritySearch(query, 2);
  return results;
};
