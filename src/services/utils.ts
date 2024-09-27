export async function checkGPUSupport() {
    if ("gpu" in navigator) {
        const gpu = await (navigator as any).gpu.requestAdapter();
        console.log("gpu", gpu);
        if (gpu !== null) {
            if (gpu.info && gpu.info.vendor.toLowerCase() === "nvidia") {
                return true;
            }
            else if ("requestAdapterInfo" in gpu) {
                const gpuInfo = await gpu.requestAdapterInfo();

                if (gpuInfo && gpuInfo.vendor.toLowerCase() === "nvidia") {
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
        const memoryCheck = navigator.deviceMemory ? navigator.deviceMemory >= 8 : false;
        const cpuCheck = navigator.hardwareConcurrency ? navigator.hardwareConcurrency >= 8 : false;

        const canHandleLocal = memoryCheck && cpuCheck && gpuCheck && !isMobile;
        // resolve(canHandleLocal);
        resolve(canHandleLocal);
    })
}

export async function checkIfOnline(): Promise<boolean> {
    return new Promise((resolve) => {
        const online = navigator.onLine;
        resolve(online);
    })
}

async function handleShortcuts() {
    document.addEventListener("keydown", async (e) => {
        // if ctrl + alt + p is pressed
        if (e.ctrlKey && e.altKey && e.key === "p") {
            console.log("ctrl + alt + p pressed");

            const { set } = await import('idb-keyval');

            await set("plus-sub", true);

            // emit custom event on window
            window.dispatchEvent(new CustomEvent('plus-sub'));

            window.location.reload();
        }
    })
}

handleShortcuts();


