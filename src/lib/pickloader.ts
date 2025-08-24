import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { TextLoader } from "langchain/document_loaders/fs/text";

export const pickFileLoader = (file: File, buffer: Buffer) => {
  const blob = new Blob([buffer]);
  // Pick loader based on MIME or extension
  let loader;
  if (file.type === "application/pdf") {
    loader = new PDFLoader(blob, { splitPages: false });
  } else if (file.type === "text/plain") {
    loader = new TextLoader(blob);
  }
  return loader;
};

export const urlLoader = (url: string) => {
  const loader = new CheerioWebBaseLoader(url, {selector: 'p'});
  return loader
}

export const textLoader = (text: string) => {
  // const loader = new TextLoader(text);
  return [
    {
      pageContent: text,
      metadata: { source: "raw-text" },
    },
  ];
}
