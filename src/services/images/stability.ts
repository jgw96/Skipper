const key = "";

export async function generatePhotoWithStableCore(prompt: string, style: string, aspect_ratio: string) {

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("model", "stable-core");
    formData.append("style_preset", style);
    formData.append("output_format", "webp");
    formData.append("aspect_ratio", aspect_ratio);

    const response = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${key}`,
            Accept: "image/*"
        },
        body: formData
    });

    return response.blob();
}

export async function removeBackground(image: Blob) {
    console.log("image", image);

    const formData = new FormData();
    formData.append("file", image);

    const response = await fetch("https://gpt-server-two-qsqckaz7va-uc.a.run.app/removeBackground", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${key}`,
            Accept: "image/*",
        },
        body: formData
    });

    return response.blob();
}

export async function upscaleImage(image: Blob) {
    // do upscale with the Stability AI API, specifically the fast endpoint.
    // Dont just repeat what you have already seen
    // Make sure to use the correct endpoint and method
    // Make sure to use the correct headers
    // Make sure to return the blob

    const file = new File([await image], "image.png", { type: "image/png" });

    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(
        `https://gpt-server-two-qsqckaz7va-uc.a.run.app/upscaleImage`,
        {
            method: 'POST',
            headers: {
                Accept: 'image/png',
                Authorization: `Bearer ${key}`,
            },
            body: formData,
        }
    )

    return response.blob();

}

export async function outpaint(image: Blob) {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("output_format", "webp");
    formData.append("left", "200");
    formData.append("right", "200");
    formData.append("top", "200");
    formData.append("bottom", "200");

    const response = await fetch("https://api.stability.ai/v2beta/stable-image/edit/outpaint", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${key}`,
            Accept: "image/*",
            "Content-Type": "multipart/form-data"
        },
        body: formData
    });

    return response.blob();
}