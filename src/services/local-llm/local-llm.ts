import { MLCEngineInterface, CreateWebWorkerMLCEngine, InitProgressReport, ChatCompletionRequest, prebuiltAppConfig } from "@mlc-ai/web-llm";

let engine: MLCEngineInterface;

export async function init(): Promise<MLCEngineInterface> {
    return new Promise(async (resolve) => {
        const initProgressCallback = (report: InitProgressReport) => {
            console.log("init progress", report);

            // emit custom event
            const event = new CustomEvent("init-progress", { detail: report });
            window.dispatchEvent(event);
        };

        const appConfig = prebuiltAppConfig;
        appConfig.useIndexedDBCache = true;

        const selectedModel = "gemma-2-2b-it-q4f32_1-MLC";

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

export async function makeLocalAIRequest(previousMessages: any[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
        console.log("engine", engine);
        if (engine) {
            const request: ChatCompletionRequest = {
                stream: true,
                messages: previousMessages,
                n: 1,
                temperature: 1.5,
                max_tokens: 256,
            };

            // const reply0 = await engine.chat.completions.create(request);
            // console.log(reply0);
            // resolve(reply0);

            const asyncChunkGenerator = await engine.chat.completions.create(request);
            resolve(asyncChunkGenerator);
        }
        else {
            reject("No engine initialized");
        }
    });
}