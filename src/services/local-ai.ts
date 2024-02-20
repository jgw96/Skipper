import * as webllm from "@mlc-ai/web-llm";
import { GenerateProgressCallback } from "@mlc-ai/web-llm/lib/types";

let chatModule: webllm.ChatModule | null = null;

const redpajama = "RedPajama-INCITE-Chat-3B-v1-q4f32_1";
const llama = "Llama-2-7b-chat-hf-q4f32_1";

export async function resetLocal() {
    chatModule?.resetChat();
}

export async function loadChatModule(model: "redpajama" | "llama" = "redpajama") {
    return new Promise<void>(async (resolve) => {
        if (!chatModule) {
            chatModule = new webllm.ChatModule();
            chatModule.setInitProgressCallback(async (report: webllm.InitProgressReport) => {
                console.log("progress", report);
                if (report.progress === 1) {

                    console.log("chat module loaded", await chatModule?.getGPUVendor());
                    resolve();
                }
            });
            // You can also try out "RedPajama-INCITE-Chat-3B-v1-q4f32_1"
            await chatModule.reload(model === "redpajama" ? redpajama : llama);
        }
        else {
            resolve();
        }
    });
}

export async function requestLocalAI(prompt: string, streamCallback: GenerateProgressCallback) {
    if (chatModule) {
        const response = await chatModule.generate(prompt, streamCallback);
        console.log("response", response);
        return response;
    }
    else {
        throw new Error("Chat module not loaded");
    }
}