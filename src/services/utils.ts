export async function checkGPUSupport() {
    if ("gpu" in navigator) {
        const gpu = await (navigator as any).gpu.requestAdapter();
        console.log("gpu", gpu);
        if (gpu !== null) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
}

let stream: MediaStream | null = null;

export async function startScreenSharing(): Promise<MediaStream | any> {
    const displayMediaOptions = {
        video: true,
        audio: false
    };
    try {
        stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        return stream;
    } catch (err) {
        console.error("Error: " + err);
        return err;
    }
}

export async function stopScreenSharing() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}