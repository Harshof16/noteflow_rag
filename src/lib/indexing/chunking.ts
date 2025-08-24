import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";


function wc(s: string) {
  const t = (s || "").trim();
  return t ? t.split(/\s+/).length : 0;
}

export const chunking = async (rawDocs : Document[], cfg = { chunkSize: 1000, chunkOverlap: 200 }) => {
  const splitter = new RecursiveCharacterTextSplitter(cfg);
  console.log("splitter", splitter);
    // rawDocs is already Document[] (from a loader)
  //   const docs = await splitter.createDocuments([text]);
  const chunks = await splitter.splitDocuments(rawDocs); //incase of when you've used loader (to load file), then use this otherwise createDocuments

    // quick stats
  const chunkChars = chunks.reduce((n, d) => n + d.pageContent.length, 0);
  const chunkWords = chunks.reduce((n, d) => n + wc(d.pageContent), 0);
  console.log('chunkChars', chunkChars)
  console.log('chunkWords', chunkWords)
  console.log('chunkLength', chunks.length)
  return { chunks, chunkChars, chunkWords, cfg };
};


export function decorateChunks(
  chunks: Document[],
  resourceId: string,
  notebookId?: string,
  sourceName?: string
) {
  return chunks.map((d, i) => ({
    ...d,
    metadata: {
      ...d.metadata,
      resourceId,
      ...(notebookId ? { notebookIds: [notebookId] } : {}),
      chunkIndex: i,
      charCount: d.pageContent.length,
      wordCount: wc(d.pageContent),
      preview: d.pageContent.slice(0, 200),
      source: sourceName, 
    },
  }));
}

export function buildResourceJson(params: {
  resourceId: string;
  type: "file" | "url" | "text";
  name?: string;
  url?: string;
  size?: number;
  cfg: { chunkSize: number; chunkOverlap: number };
  totals: { totalChars: number; totalWords: number };
  chunkStats: { chunkChars: number; chunkWords: number; count: number };
}) {
  const { resourceId, type, name, url, size, cfg, totals, chunkStats } = params;
  const coverage =
    totals.totalWords > 0
      ? Math.round((chunkStats.chunkWords / totals.totalWords) * 100)
      : 0;

  return {
    id: resourceId,
    type,
    name,
    url,
    size,
    status: "indexed" as const,
    chunkSize: cfg.chunkSize,
    overlap: cfg.chunkOverlap,
    chunkCount: chunkStats.count,
    stats: {
      wordsTotal: totals.totalWords,
      wordsIndexed: chunkStats.chunkWords,
      charsTotal: totals.totalChars,
      charsIndexed: chunkStats.chunkChars,
      coveragePercent: coverage,
    },
    // matches is empty now; you’ll fill it after a retrieval call
    matches: [] as Array<{ chunkIndex: number; score: number }>,
    createdAt: new Date().toISOString(),
  };
}

export function summarizeDocs(docs: Document[]) {
  const totalChars = docs.reduce((n, d) => n + d.pageContent.length, 0);
  const totalWords = docs.reduce((n, d) => n + wc(d.pageContent), 0);
  return { totalChars, totalWords };
}
