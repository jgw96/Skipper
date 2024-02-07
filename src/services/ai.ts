let previousMessages: any[] = [];
let currentBase64Data: string = "";

export async function makeAIRequest(base64data: string, prompt: string, previousMessages: any[]) {
    currentBase64Data = base64data;

    // add instruction to format response as HTML
    prompt = prompt + " " + "format your response as HTML, but dont mention that it has been formatted to HTML and just return the HTML";

    const response = await fetch(`https://gpt-server-qsqckaz7va-uw.a.run.app/sendchat?prompt=${prompt}`, {
        method: 'POST',
        headers: new Headers({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify({
            image: base64data,
            previousMessages: previousMessages
        })
    });

    const data = await response.json();
    console.log(data.choices[0]);

    return data;
}

export const requestGPT = async (prompt: string) => {
    // add instruction to format response as HTML
    prompt = prompt + " " + "format your response as HTML, but dont mention that it has been formatted to HTML and just return the HTML";

    previousMessages.push({
        role: "user",
        content: prompt,
        image: currentBase64Data
    })

    const response = await fetch(`https://gpt-server-qsqckaz7va-uw.a.run.app/sendchat?prompt=${prompt}`, {
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
    const response = await fetch(`https://gpt-server-qsqckaz7va-uw.a.run.app/createtitle?prompt=${prompt}`, {
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
        const response = await fetch(`https://gpt-server-qsqckaz7va-uw.a.run.app/texttospeech?text=${script}`, {
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