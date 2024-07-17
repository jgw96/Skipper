import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import { ChatOpenAI } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";

import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { createRetrievalChain } from "langchain/chains/retrieval";


const llm = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  temperature: 0,
  openAIApiKey: "sk-proj-tdLVPM8pXsab6F0LIlxTT3BlbkFJAZv18F7bSoqKt4j5q9xf",
  apiKey: "sk-proj-tdLVPM8pXsab6F0LIlxTT3BlbkFJAZv18F7bSoqKt4j5q9xf",
});


export async function setupLoader(docsData: Document[]) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const docs = await splitter.splitDocuments(docsData);

  const vectorstore = await MemoryVectorStore.fromDocuments(
    docs,
    new OpenAIEmbeddings({
      openAIApiKey: "sk-proj-tdLVPM8pXsab6F0LIlxTT3BlbkFJAZv18F7bSoqKt4j5q9xf",
      apiKey: "sk-proj-tdLVPM8pXsab6F0LIlxTT3BlbkFJAZv18F7bSoqKt4j5q9xf",
    })
  );

  const prompt =
    ChatPromptTemplate.fromTemplate(`Answer the following question based only on the provided context:

<context>
{context}
</context>

Question: {input}`);

  const documentChain = await createStuffDocumentsChain({
    llm,
    prompt,
  });
  const retriever = vectorstore.asRetriever();

  const retrievalChain = await createRetrievalChain({
    combineDocsChain: documentChain,
    retriever,
  });

  return retrievalChain;
}