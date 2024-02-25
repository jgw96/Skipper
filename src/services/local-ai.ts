import * as webllm from "@mlc-ai/web-llm";
import { GenerateProgressCallback } from "@mlc-ai/web-llm/lib/types";

let chatModule: webllm.ChatModule | null = null;

const redpajama = "RedPajama-INCITE-Chat-3B-v1-q4f32_1";
const llama = "Llama-2-7b-chat-hf-q4f32_1";
const gemma = "gemma-2b-it-q4f32_1";

export async function resetLocal() {
    chatModule?.resetChat();
}

export async function loadChatModule(model: "redpajama" | "llama" | "gemma" = "redpajama") {
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

            const myAppConfig: webllm.AppConfig = {
                model_list: [
                    {
                        "model_url": "https://huggingface.co/mlc-ai/RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC/resolve/main/",
                        "model_lib_url": "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/RedPajama-INCITE-Chat-3B-v1/RedPajama-INCITE-Chat-3B-v1-q4f32_1-ctx2k-webgpu.wasm",
                        "local_id": "RedPajama-INCITE-Chat-3B-v1-q4f32_1",
                    },
                    {
                        "model_url": "https://huggingface.co/mlc-ai/Llama-2-7b-chat-hf-q4f32_1-MLC/resolve/main/",
                        "model_lib_url": "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/Llama-2-7b-chat-hf/Llama-2-7b-chat-hf-q4f32_1-ctx4k_cs1k-webgpu.wasm",
                        "local_id": "Llama-2-7b-chat-hf-q4f32_1"
                    },
                    {
                        "model_url": "https://huggingface.co/mlc-ai/gemma-2b-it-q4f32_1-MLC/resolve/main/",
                        "local_id": "gemma-2b-it-q4f32_1",
                        "model_lib_url": "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/gemma-2b-it/gemma-2b-it-q4f32_1-ctx1k_cs1k-webgpu.wasm"
                    },
                ]
            }

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

            // You can also try out "RedPajama-INCITE-Chat-3B-v1-q4f32_1"
            await chatModule.reload(modelToUse, undefined, myAppConfig);
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