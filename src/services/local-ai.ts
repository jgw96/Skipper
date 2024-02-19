import * as webllm from "@mlc-ai/web-llm";
import { GenerateProgressCallback } from "@mlc-ai/web-llm/lib/types";

let chatModule: webllm.ChatModule | null = null;

export async function resetLocal() {
    chatModule?.resetChat();
}

export async function loadChatModule() {
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
            await chatModule.reload("RedPajama-INCITE-Chat-3B-v1-q4f32_1");
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