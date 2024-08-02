import { getOpenAIKey } from "./keys";

let previousMessages: any[] = [];
let currentBase64Data: string = "";

const extraPrompt = "";

export let chosenModelShipper: "openai" | "google" | "redpajama" | "llama" | "gemma" | "phi3" = "openai";

let GPTKey = await getOpenAIKey();

// @ts-ignore
window.addEventListener("gpt-key-changed", (e: CustomEvent) => {
    GPTKey = e.detail.key;
});

export async function setChosenModelShipper(shipper: "openai" | "google" | "redpajama" | "llama" | "gemma" | "phi3") {
    chosenModelShipper = shipper;
}

// @ts-ignore
export async function makeAIRequestWithGemini(base64data: string, prompt: string, previousMessages: any[]): Promise<any> {
    // if (!genAI) {
    //     const newGenAI = new GoogleGenerativeAI(apiKey);
    //     genAI = newGenAI;
    // }

    // const model = genAI.getGenerativeModel({
    //     model: base64data && base64data.length > 0 ? "gemini-pro-vision" : "gemini-pro",
    // });
    // potentialGemeniModel = model;

    // // fix previousMessages to google history format
    // const history = previousMessages.map((message) => {
    //     return {
    //         role: message.role === "user" ? "user" : "model",
    //         parts: message.content
    //     }
    // });

    // const modelMessageIndex = history.findIndex((message) => message.parts.trim() === prompt.trim());
    // if (modelMessageIndex !== -1) {
    //     history.splice(modelMessageIndex, 1);
    // }

    // if (base64data) {
    //     // remove first part of base64 data
    //     const base64dataParts = base64data.split(",")[1];


    //     const result = await potentialGemeniModel?.generateContentStream([prompt, {
    //         inlineData: { data: base64dataParts, mimeType: "image/jpeg" }
    //     }]);
    //     return result?.stream;
    // }
    // else {
    //     const chat = potentialGemeniModel!.startChat({
    //         history,
    //         generationConfig: {
    //             maxOutputTokens: 2000,
    //         },
    //     });

    //     // const result = await chat.sendMessage(prompt);
    //     const result = await chat.sendMessageStream(prompt);
    //     return result.stream;
    // }
}


let localLLMInit = false;
export async function makeAIRequest(base64data: string, prompt: string, previousMessages: any[]) {
    console.log("makeAIRequest", base64data, prompt, previousMessages)
    currentBase64Data = base64data;

    // add instruction to format response as HTML
    prompt = prompt + ". " + extraPrompt;
    // https://gpt-server-two-qsqckaz7va-uc.a.run.app/

    const authToken = localStorage.getItem("accessToken");
    const taskListID = localStorage.getItem("taskListID");
    const lat = localStorage.getItem("lat");
    const long = localStorage.getItem("long");
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // if there is an image, go to the cloud
    // otherwise, lets try something
    if (currentBase64Data && currentBase64Data.length > 0) {
        const response = await fetch(`https://gpt-server-two-qsqckaz7va-uc.a.run.app/sendchatwithactions?prompt=${prompt}&key=${GPTKey}&msAuthToken=${authToken}&taskListID="${taskListID}&lat=${lat}&long=${long}&timezone=${timezone}`, {
            method: 'POST',
            headers: new Headers({
                "Content-Type": "application/json",
            }),
            body: JSON.stringify({
                image: currentBase64Data || base64data,
                previousMessages: previousMessages,
                key: GPTKey,
                lat: lat,
                long: long
            })
        });

        const data = await response.json();
        console.log(data.choices[0]);

        return data;
    }
    else {
        // will do device check
        const { deviceCheck } = await import("../services/utils");
        const deviceCheckFlag = await deviceCheck();

        if (deviceCheckFlag) {
            if (localLLMInit === false) {
                localLLMInit = true;
                const { init } = await import("../services/local-llm/local-llm");
                await init();
            }

            const { makeLocalAIRequest } = await import("../services/local-llm/local-llm");
            const data = await makeLocalAIRequest(previousMessages);
            console.log(data);

            return data;
        }
        else {
            const response = await fetch(`https://gpt-server-two-qsqckaz7va-uc.a.run.app/sendchatwithactions?prompt=${prompt}&key=${GPTKey}&msAuthToken=${authToken}&taskListID="${taskListID}&lat=${lat}&long=${long}&timezone=${timezone}`, {
                method: 'POST',
                headers: new Headers({
                    "Content-Type": "application/json",
                }),
                body: JSON.stringify({
                    image: currentBase64Data || base64data,
                    previousMessages: previousMessages,
                    key: GPTKey,
                    lat: lat,
                    long: long
                })
            });

            const data = await response.json();
            console.log(data.choices[0]);

            return data;
        }
    }
}

export async function makeAIRequestWithImage(base64data: string, prompt: string, previousMessages: any[]) {
    console.log("makeAIRequest", base64data, prompt, previousMessages)
    currentBase64Data = base64data;

    // add instruction to format response as HTML
    prompt = prompt + ". " + extraPrompt;
    // https://gpt-server-two-qsqckaz7va-uc.a.run.app/

    const authToken = localStorage.getItem("accessToken");
    const taskListID = localStorage.getItem("taskListID");

    const response = await fetch(`https://gpt-server-two-qsqckaz7va-uc.a.run.app//sendchat?prompt=${prompt}&key=${GPTKey}&msAuthToken=${authToken}&taskListID="${taskListID}"`, {
        method: 'POST',
        headers: new Headers({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify({
            image: currentBase64Data || base64data,
            previousMessages: previousMessages,
            key: GPTKey
        })
    });

    const data = await response.json();
    console.log(data.choices[0]);

    return data;
}

export async function makeAIRequestStreaming(base64data: string, prompt: string, previousMessages: any[]) {
    currentBase64Data = base64data;

    // add instruction
    prompt = prompt + ". " + extraPrompt;

    // previousMessages is an array, but I need to send it as a query param
    // so I'm going to convert it to a string
    const stringifiedPreviousMessages = JSON.stringify(previousMessages);

    const evtSource = new EventSource(`https://gpt-server-two-qsqckaz7va-uc.a.run.app//sendchatstreaming?prompt=${prompt}&key=${GPTKey}&image=${base64data}&previousMessages=${encodeURIComponent(stringifiedPreviousMessages)}`);
    return evtSource;
}

export const requestGPT = async (prompt: string) => {
    // add instruction to format response as HTML
    prompt = prompt + " " + extraPrompt;

    previousMessages.push({
        role: "user",
        content: prompt,
        image: currentBase64Data
    })

    const response = await fetch(`https://gpt-server-two-qsqckaz7va-uc.a.run.app//sendchat?prompt=${prompt}&key=${GPTKey}`, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify({
            previousMessages,
            key: GPTKey
        })
    });
    const data = await response.json();

    previousMessages = [
        ...previousMessages,
        {
            role: "assistant",
            content: data.choices[0].message.content,
        }
    ]

    console.log('data', data);

    return data;
};

export const makeTitleRequest = async (prompt: string) => {
    const response = await fetch(`https://gpt-server-two-qsqckaz7va-uc.a.run.app//createtitle?prompt=${prompt}&key=${GPTKey}`, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
        })
    });
    const data = await response.json();

    return data.choices[0].message.content;
}

export async function generateImage(prompt: string) {
    const response = await fetch(`https://gpt-server-two-qsqckaz7va-uc.a.run.app//generateimage?prompt=${prompt}&key=${GPTKey}`, {
        method: "GET",
        headers: new Headers({
            "Content-Type": "application/json",
        })
    });
    const data = await response.json();

    console.log("blob", data);

    return data.data[0].url;
}

export async function doTextToSpeech(script: string) {
    return new Promise(async (resolve) => {
        const qualityCheck = localStorage.getItem("voiceQuality");
        if (qualityCheck === "low") {
            // use web speech api
            const synth = window.speechSynthesis;
            const utterThis = new SpeechSynthesisUtterance(script);
            synth.speak(utterThis);

            resolve(script);
        }
        else {
            if (chosenModelShipper === "phi3") {
                const { textToSpeech } = await import("web-ai-toolkit");
                const data: Float32Array = (await textToSpeech(script) as Float32Array);
                const audioCtx = new AudioContext();

                const myArrayBuffer = audioCtx.createBuffer(1, data.length, 16000);
                myArrayBuffer.copyToChannel(data, 0);

                const source = audioCtx.createBufferSource();
                source.buffer = myArrayBuffer;

                // Connect to the audio output
                source.connect(audioCtx.destination);

                source.onended = () => {
                    resolve(script);
                }

                // Start playback
                source.start();
            }
            else {
                const response = await fetch(`https://gpt-server-two-qsqckaz7va-uc.a.run.app/texttospeech?text=${script}&key=${GPTKey}`, {
                    method: "POST",
                    headers: new Headers({
                        "Content-Type": "application/json",
                    }),
                    body: JSON.stringify({
                        previousMessages,
                        key: GPTKey
                    })
                });
                const data = await response.blob();

                const audio = new Audio(URL.createObjectURL(data));

                audio.onended = () => {
                    resolve(script);
                }

                audio.play();
            }
        }
    });
}

export async function doSpeechToText(audioFile: File) {
    return new Promise(async (resolve, reject) => {
        const goodData = new FormData();
        goodData.append("file", audioFile, audioFile.name);

        try {
            const response = await fetch(`https://gpt-server-two-qsqckaz7va-uc.a.run.app/speechtotext?key=${GPTKey}`, {
                method: "POST",
                body: goodData,
            });

            const transcript = await response.json();

            if (transcript) {
                resolve(transcript);
            }
            else {
                reject("No transcription returned")
            }
        }
        catch (err) {
            console.error('err', err)
            reject(err);
        }
    })
}