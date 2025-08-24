import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

export const loadVectorStore = async () => {
  return await QdrantVectorStore.fromExistingCollection(
    new OpenAIEmbeddings({ model: "text-embedding-3-small" }),
    {
      collectionName: "notebookLm",
      url: process.env.QDRANT_URL || "http://localhost:6333",
      apiKey: process.env.QDRANT_API_KEY || "",
    }
  );
};
