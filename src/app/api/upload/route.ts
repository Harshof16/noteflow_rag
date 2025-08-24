// app/api/upload/route.ts
import { NextResponse } from "next/server";
import {
  buildResourceJson,
  chunking,
  decorateChunks,
  summarizeDocs,
} from "@/lib/indexing/chunking";
import { savingEmbeddings } from "@/lib/indexing/storingdb";
import { pickFileLoader, textLoader, urlLoader } from "@/lib/pickloader";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  try {
    let docs;
    let type: "file" | "url" | "text";
    let baseMeta: { name?: string; url?: string; size?: number } = {};
    let notebookId: string | null = null;

    const contentType = req.headers.get("content-type") || "";
    console.log("req", contentType);

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      notebookId = formData.get("notebookId") as string;
      type = "file";
      console.log("filer", file);
      if (!file) {
        return NextResponse.json(
          { error: "No file uploaded" },
          { status: 400 }
        );
      }
      baseMeta.name = file.name;
      baseMeta.size = file.size;

      // Convert to Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // picking file loader
      const loader = pickFileLoader(file, buffer);
      if (!loader) {
        return NextResponse.json(
          { error: "Unsupported file type" },
          { status: 400 }
        );
      }
      docs = await loader.load();
    } else {
      const body = await req.json();
      notebookId = body.notebookId;

      if (body.text) {
        console.log("Received: ", body.text);
        docs = textLoader(body.text);
        type = "text";
        baseMeta.name = body.text.slice(0, 10) + "...";
        baseMeta.size = body.text.length;
      } else if (body.url) {
        const loader = urlLoader(body.url);
        docs = await loader.load();
        type = "url";
        baseMeta.name = new URL(body.url).hostname;
      } else {
        return NextResponse.json(
          { error: "No valid input provided." },
          { status: 400 }
        );
      }
    }
    // indexing
    const cfg = { chunkSize: 1000, chunkOverlap: 200 };
    const { chunks, chunkChars, chunkWords } = await chunking(docs, cfg);
    const totals = summarizeDocs(docs);
    console.log("savedChunks", chunks);

    const resourceId = uuid();  
    const sourceName = baseMeta.name
    const decorated = decorateChunks(chunks, resourceId, notebookId, sourceName);
    await savingEmbeddings(decorated, type);
    console.log("embeddings saved");

    const chunkStats = { count: decorated.length, chunkChars, chunkWords };
    const resourceJson = buildResourceJson({
      resourceId,
      type,
      name: baseMeta.name,
      url: baseMeta.url,
      size: baseMeta.size,
      cfg,
      totals,
      chunkStats,
    });

    const responseJson = {
      success: true,
      notebookId: notebookId ?? null,
      resource: resourceJson,
    };

    return NextResponse.json({ ...responseJson }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
