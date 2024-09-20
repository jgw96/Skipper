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
    const formData = new FormData();
    formData.append("image", image);
    formData.append("output_format", "webp");

    const response = await fetch("https://api.stability.ai/v2beta/stable-image/edit/remove-background", {
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
    try {
        const formData = new FormData();
        formData.append("image", URL.createObjectURL(image));
        formData.append("output_format", "webp");
        formData.append("prompt", "UHD-4k");

        const response = await fetch("https://api.stability.ai/v2beta/stable-image/upscale/conservative", {
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
    catch (error) {
        console.log("Error", error);
        return error
    }
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