import { ChatOpenAI } from "@langchain/openai";
import type { ChatPromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";
import { createOpenAIFunctionsAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";
import { getOpenAIKey } from "../keys";

const key = await getOpenAIKey();

const llm = new ChatOpenAI({
    model: "gpt-3.5-turbo",
    temperature: 0,
    openAIApiKey: key,
    apiKey: key,
});

export async function setupAgent(tools: any) {
    // Get the prompt to use - you can modify this!
    // If you want to see the prompt in full, you can at:
    // https://smith.langchain.com/hub/hwchase17/openai-functions-agent
    const prompt = await pull<ChatPromptTemplate>(
        "hwchase17/openai-functions-agent"
    );

    const agent = await createOpenAIFunctionsAgent({
        llm,
        tools,
        prompt,
    });

    return new AgentExecutor({
        agent,
        tools,
    });
}