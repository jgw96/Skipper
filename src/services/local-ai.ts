import * as webllm from "@mlc-ai/web-llm";

let chatModule: webllm.WebWorkerEngine | null = null;

const redpajama = "RedPajama-INCITE-Chat-3B-v1-q4f32_1";
const llama = "Llama-2-7b-chat-hf-q4f32_1";
const gemma = "gemma-2b-it-q4f32_1";

export async function resetLocal() {
    chatModule?.resetChat();
}

const initProgressCallback = async (report: webllm.InitProgressReport): Promise<void> => {
    return new Promise(async (resolve) => {
        console.log("progress", report);
        if (report.progress === 1 && report.text.includes("Finish loading on WebGPU")) {

            console.log("chat module loaded", await chatModule?.getGPUVendor(), await chatModule?.getMaxStorageBufferBindingSize());
            resolve();
        }
    });
};

export async function loadChatModule(model: "redpajama" | "llama" | "gemma" = "redpajama") {
    return new Promise<void>(async (resolve) => {
        if (!chatModule) {
            let modelToUse = redpajama;
            switch (model) {
                case "llama":
                    modelToUse = llama;
                    break;
                case "gemma":
                    modelToUse = gemma;
                    break;
                default:
                    modelToUse = redpajama;
                    break;
            }

            const appConfig = webllm.prebuiltAppConfig;
            appConfig.useIndexedDBCache = true;

            // chatModule = new webllm.ChatModule();
            chatModule = await webllm.CreateWebWorkerEngine(new Worker(
                new URL('./local-ai-worker.ts', import.meta.url),
                { type: 'module' }
            ),
                modelToUse,
                {
                    initProgressCallback
                }
            );

            resolve();
        }
        else {
            resolve();
        }
    });
}

export async function requestLocalAI(previousMessages: any[]) {
    if (chatModule) {
        const request: webllm.ChatCompletionRequest = {
            stream: true,
            messages: previousMessages,
            temperature: 1.5,
            logprobs: true,
            top_logprobs: 2,
        };

        const asyncChunkGenerator = await chatModule?.chat.completions.create(request);
        return asyncChunkGenerator;

    }
    else {
        throw new Error("Chat module not loaded");
    }
}