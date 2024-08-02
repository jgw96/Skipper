import { MLCEngineInterface, CreateWebWorkerMLCEngine, InitProgressReport, ChatCompletionRequest } from "@mlc-ai/web-llm";

let engine: MLCEngineInterface;

export async function init(): Promise<MLCEngineInterface> {
    return new Promise(async (resolve) => {
        const initProgressCallback = (report: InitProgressReport) => {
            console.log("init progress", report);
        };

        const selectedModel = "gemma-2-2b-it-q4f32_1-MLC-1k";

        const worker = new Worker(new URL("./local-llm-worker.ts", import.meta.url), { type: "module" });
        console.log("worker", worker);

        engine =
            await CreateWebWorkerMLCEngine(
                worker,
                selectedModel,
                { initProgressCallback: initProgressCallback },
            );

        resolve(engine);
    });
}

export async function makeLocalAIRequest( previousMessages: any[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
        console.log("engine", engine);
        if (engine) {
            const request: ChatCompletionRequest = {
                messages: previousMessages,
                n: 3,
                temperature: 1.5,
                max_tokens: 256,
            };

            const reply0 = await engine.chat.completions.create(request);
            console.log(reply0);
            resolve(reply0);
        }
        else {
            reject("No engine initialized");
        }
    });
}