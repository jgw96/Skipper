import * as webllm from "@mlc-ai/web-llm";
import type { EmbeddingsInterface } from "@langchain/core/embeddings";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { formatDocumentsAsString } from "langchain/util/document";
import { PromptTemplate } from "@langchain/core/prompts";
import {
    RunnableSequence,
    RunnablePassthrough,
} from "@langchain/core/runnables";

class WebLLMEmbeddings implements EmbeddingsInterface {
    engine: webllm.MLCEngineInterface;
    modelId: string;
    constructor(engine: webllm.MLCEngineInterface, modelId: string) {
        this.engine = engine;
        this.modelId = modelId;
    }

    async _embed(texts: string[]): Promise<number[][]> {
        console.log("Embedding", texts);
        const reply = await this.engine.embeddings.create({
            input: texts,
            model: this.modelId,
        });
        const result: number[][] = [];
        for (let i = 0; i < texts.length; i++) {
            result.push(reply.data[i].embedding);
        }
        console.log("Embedding result", result);
        return result;
    }

    async embedQuery(document: string): Promise<number[]> {
        return this._embed([document]).then((embeddings) => embeddings[0]);
    }

    async embedDocuments(documents: string[]): Promise<number[][]> {
        return this._embed(documents);
    }
}

const initProgressCallback = (report: webllm.InitProgressReport) => {
    console.log('Progress:', report);
};

let vectorStore: MemoryVectorStore;
let engine: webllm.MLCEngineInterface;
let llmModelId: string;

export async function loadUpDocuments(texts: string[]): Promise<MemoryVectorStore> {
    const embeddingModelId = "snowflake-arctic-embed-m-q0f32-MLC-b4";
    llmModelId = "SmolLM-1.7B-Instruct-q4f32_1-MLC";
    engine = await webllm.CreateMLCEngine(
        [embeddingModelId, llmModelId],
        {
            initProgressCallback: initProgressCallback,
            logLevel: "INFO", // specify the log level
        },
    );

    vectorStore = await MemoryVectorStore.fromTexts(
        ["mitochondria is the powerhouse of the cell", ...texts],
        [{ id: 1 }],
        new WebLLMEmbeddings(engine, embeddingModelId),
    );
    return vectorStore;
}

export async function doSearch(query: string): Promise<string> {
    const retriever = vectorStore.asRetriever();
    console.log("Retriever", retriever);

    const prompt =
        PromptTemplate.fromTemplate(`Answer the question based only on the following context:
    {context}

    Question: {question}`);

    const chain = RunnableSequence.from([
        {
            context: retriever.pipe(formatDocumentsAsString),
            question: new RunnablePassthrough(),
        },
        prompt,
    ]);
    console.log("chain", chain);

    const formattedPrompt = (
        await chain.invoke(query)
    ).toString();
    const reply = await engine.chat.completions.create({
        messages: [{ role: "user", content: formattedPrompt }],
        model: llmModelId,
    });

    console.log("embedding reply", reply.choices[0].message.content);
    return reply.choices[0].message.content || "";
}

export async function simpleRAG(texts: string[]): Promise<string> {
    // // 0. Load both embedding model and LLM to a single WebLLM Engine
    // const embeddingModelId = "snowflake-arctic-embed-m-q0f32-MLC-b4";
    // const llmModelId = "SmolLM-1.7B-Instruct-q4f32_1-MLC";
    // const engine: webllm.MLCEngineInterface = await webllm.CreateMLCEngine(
    //     [embeddingModelId, llmModelId],
    //     {
    //         initProgressCallback: initProgressCallback,
    //         logLevel: "INFO", // specify the log level
    //     },
    // );

    // const vectorStore = await MemoryVectorStore.fromTexts(
    //     ["mitochondria is the powerhouse of the cell", ...texts],
    //     [{ id: 1 }],
    //     new WebLLMEmbeddings(engine, embeddingModelId),
    // );
    const vectorStore = await loadUpDocuments(texts);
    const retriever = vectorStore.asRetriever();
    console.log("Retriever", retriever);

    const prompt =
        PromptTemplate.fromTemplate(`Answer the question based only on the following context:
    {context}

    Question: {question}`);

    const chain = RunnableSequence.from([
        {
            context: retriever.pipe(formatDocumentsAsString),
            question: new RunnablePassthrough(),
        },
        prompt,
    ]);
    console.log("chain", chain);

    const formattedPrompt = (
        await chain.invoke("What is the powerhouse of the cell?")
    ).toString();
    const reply = await engine.chat.completions.create({
        messages: [{ role: "user", content: formattedPrompt }],
        model: llmModelId,
    });

    console.log("embedding reply", reply.choices[0].message.content);
    return reply.choices[0].message.content || "";

    /*
      "The powerhouse of the cell is the mitochondria."
    */
}