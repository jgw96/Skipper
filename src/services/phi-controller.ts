let worker: any = null;

export async function loadPhi() {
    return new Promise<void>(async (resolve) => {
        if (!worker) {
            worker = new Worker(
                new URL('./phi-worker.ts', import.meta.url),
                { type: 'module' }
            );

            worker.onmessage = (event: MessageEvent) => {
                console.log(event.data);
            }

            worker.postMessage({ type: 'load' });

            resolve();
        }
        else {
            resolve();
        }
    });
}

export async function runOnPhi(messages: any[]) {
    return new Promise<void>(async (resolve) => {
        if (worker) {
            worker.postMessage({ type: 'generate', data: messages });
        }

        resolve();
    });
}