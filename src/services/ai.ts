import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";

let previousMessages: any[] = [];
let currentBase64Data: string = "";

const extraPrompt = "You are a helpful chat assistant with a calming tone. You are formal, but not too formal. Format your response to the former message as HTML, but dont mention that it has been formatted to HTML and just return the HTML. ";

const apiKey = "AIzaSyCdVnZtDMnmKPo8fhw-4MWybfAA1zcEbDs";
let potentialGemeniModel: GenerativeModel | null = null;
export let chosenModelShipper: "openai" | "google" | "redpajama" | "llama" = "openai";
let genAI: GoogleGenerativeAI | null = null;

export async function setChosenModelShipper(shipper: "openai" | "google" | "redpajama" | "llama") {
    chosenModelShipper = shipper;
}

// @ts-ignore
export async function makeAIRequestWithGemini(base64data: string, prompt: string, previousMessages: any[]) {
    if (!genAI) {
        const newGenAI = new GoogleGenerativeAI(apiKey);
        genAI = newGenAI;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        potentialGemeniModel = model;
    }

    // fix previousMessages to google history format
    const history = previousMessages.map((message) => {
        return {
            role: message.role === "user" ? "user" : "model",
            parts: message.content
        }
    });

    const modelMessageIndex = history.findIndex((message) => message.parts.trim() === prompt.trim());
    console.log("modelMessageIndex", modelMessageIndex, prompt, history)
    if (modelMessageIndex !== -1) {
        history.splice(modelMessageIndex, 1);
    }

    console.log("history", history)

    const chat = potentialGemeniModel!.startChat({
        history,
        generationConfig: {
            maxOutputTokens: 2000,
        },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    const dataResponse = {
        choices: [
            {
                message: {
                    content: text
                }
            }
        ]
    };

    return dataResponse;
}

export async function makeAIRequest(base64data: string, prompt: string, previousMessages: any[]) {
    console.log("makeAIRequest", base64data, prompt, previousMessages)
    currentBase64Data = base64data;

    // add instruction to format response as HTML
    prompt = prompt + ". " + extraPrompt;

    const response = await fetch(`https://gpt-server-two-qsqckaz7va-uc.a.run.app/sendchat?prompt=${prompt}`, {
        method: 'POST',
        headers: new Headers({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify({
            image: currentBase64Data || base64data,
            previousMessages: previousMessages
        })
    });

    const data = await response.json();
    console.log(data.choices[0]);

    return data;
}

export async function makeAIRequestStreaming(base64data: string, prompt: string, previousMessages: any[]) {
    currentBase64Data = base64data;

    // add instruction to format response as HTML
    prompt = prompt + ". " + extraPrompt;

    // const response = await fetch(`http://localhost:3000/sendchatstreaming?prompt=${prompt}`, {
    //     method: 'POST',
    //     headers: new Headers({
    //         "Content-Type": "application/json",
    //     }),
    //     body: JSON.stringify({
    //         image: base64data,
    //         previousMessages: previousMessages
    //     })
    // });

    // const data = await response.json();
    // console.log(data.choices[0]);

    // return data;

    // previousMessages is an array, but I need to send it as a query param
    // so I'm going to convert it to a string
    const stringifiedPreviousMessages = JSON.stringify(previousMessages);

    const evtSource = new EventSource(`https://gpt-server-two-qsqckaz7va-uc.a.run.app/sendchatstreaming?prompt=${prompt}&image=${base64data}&previousMessages=${stringifiedPreviousMessages}`);
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

    const response = await fetch(`https://gpt-server-two-qsqckaz7va-uc.a.run.app/sendchat?prompt=${prompt}`, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify({
            previousMessages
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
    const response = await fetch(`https://gpt-server-two-qsqckaz7va-uc.a.run.app/createtitle?prompt=${prompt}`, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
        })
    });
    const data = await response.json();

    return data.choices[0].message.content;
}

export async function doTextToSpeech(script: string) {
    return new Promise(async (resolve) => {
        const response = await fetch(`https://gpt-server-two-qsqckaz7va-uc.a.run.app/texttospeech?text=${script}`, {
            method: "POST",
            headers: new Headers({
                "Content-Type": "application/json",
            }),
            body: JSON.stringify({
                previousMessages
            })
        });
        const data = await response.blob();

        const audio = new Audio(URL.createObjectURL(data));

        audio.onended = () => {
            resolve(script);
        }

        audio.play();
    });
}