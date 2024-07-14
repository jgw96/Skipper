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

export async function handleShareTargetFile() {
    return new Promise((resolve => {
        if ((window as any).shareTargetFile) {
            const sharedFile = (window as any).shareTargetFile;

            console.log("sharedFile blob image", (window as any).shareTargetFile);

            if (sharedFile) {
                // this.recorded = file;
                console.log("file", sharedFile);

                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64data = e.target?.result;
                    resolve(base64data)
                }

                reader.readAsDataURL(sharedFile);
            }
        }
    }))
}

export async function deviceCheck() {
    return new Promise(async (resolve) => {
        // checking device specs to the best of our ability

        const device = navigator.userAgent;
        const isMobile = /Mobi/.test(device);

        const gpuCheck = await checkGPUSupport();
        // @ts-ignore
        const memoryCheck = navigator.deviceMemory ? navigator.deviceMemory > 4 : false;
        const cpuCheck = navigator.hardwareConcurrency ? navigator.hardwareConcurrency > 4 : false;

        const canHandleLocal = memoryCheck && cpuCheck && gpuCheck && !isMobile;
        resolve(canHandleLocal);
    })
}