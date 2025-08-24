import { QdrantVectorStore } from "@langchain/qdrant";
import "dotenv/config";
import { generateEmbeddings } from "./embeddings";
import { retreivingFromDb } from "../retreiving/queryfetch";

export const savingEmbeddings = async (docs: any[], type) => {
  const embeddings = generateEmbeddings();
  console.log("docs passed to savingEmbeddsings:", docs);
const docsWithMetadata = docs.map((doc) => ({
    ...doc,
    metadata: {
      ...doc.metadata,
      source: doc.metadata?.source || type || "raw-text", // or "file" / "url"
      preview: doc.pageContent.slice(0, 200), // save a snippet for dashboard
    },
  }));

  await QdrantVectorStore.fromDocuments(docsWithMetadata, embeddings, {
    collectionName: "notebookLm",
    url: process.env.QDRANT_URL || "http://localhost:6333",
    apiKey: process.env.QDRANT_API_KEY || "",
  });
  const results = await retreivingFromDb(docs[0].pageContent)
  console.log('results', results)
};
