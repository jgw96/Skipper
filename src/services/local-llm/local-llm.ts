import { MLCEngineInterface, CreateWebWorkerMLCEngine, InitProgressReport, ChatCompletionRequest, prebuiltAppConfig, hasModelInCache } from "@mlc-ai/web-llm";

let engine: MLCEngineInterface;

export async function init(): Promise<MLCEngineInterface> {
    return new Promise(async (resolve, reject) => {
        const initProgressCallback = (report: InitProgressReport) => {
            console.log("init progress", report);

            // emit custom event
            const event = new CustomEvent("init-progress", { detail: report });
            window.dispatchEvent(event);
        };

        const appConfig = prebuiltAppConfig;

        const FP16 = await checkFP16Support();
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        let selectedModel;
        // const selectedModel = FP16 ? "SmolLM-1.7B-Instruct-q4f16_1-MLC" : "SmolLM-1.7B-Instruct-q4f32_1-MLC";
        if (isMobile) {
            selectedModel = FP16 ? "SmolLM-1.7B-Instruct-q4f16_1-MLC" : "SmolLM-1.7B-Instruct-q4f32_1-MLC";
        }
        else {
            selectedModel = FP16 ? "Phi-3.5-mini-instruct-q4f16_1-MLC-1k" : "Phi-3.5-mini-instruct-q4f32_1-MLC-1k";
        }

        let modelCached = await hasModelInCache(selectedModel, appConfig);
        console.log("hasModelInCache: ", modelCached);

        // check if online
        const networkFlag = navigator.onLine;

        if (!modelCached && !networkFlag) {
            console.error("Model not cached and no network connection");
            reject("Model not cached and no network connection");
        }

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

async function checkFP16Support() {
    //@ts-ignore
    if (!navigator.gpu) {
      throw Error("WebGPU not supported.");
    }

    //@ts-ignore
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw Error("Couldn't request WebGPU adapter.");
    }

    const adapterFeatures = adapter.features;
    if (adapterFeatures.has("shader-f16")) {
      console.log("FP16 support is available.");
      return true;
    } else {
      console.log("FP16 support is not available.");
      return false;
    }
  }
