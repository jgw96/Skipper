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