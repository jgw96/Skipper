export function setUpDragDrop(dropElement: HTMLElement) {
    dropElement?.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropElement.classList.add("drag-over");
    });

    dropElement?.addEventListener('dragleave', (event) => {
        event.preventDefault();
        dropElement.classList.remove("drag-over");
    });

    dropElement?.addEventListener('drop', async (event) => {
        event.preventDefault();
        dropElement.classList.remove("drag-over");

        const dt = event.dataTransfer;
        const files = dt!.files;

        if (files.length > 0 && files[0].type.includes("image")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64data = e.target?.result;
                // this.addImageToConvo(base64data as string);
                window.dispatchEvent(new CustomEvent('image-dropped', {
                    detail: {
                        data: base64data
                    }
                }));
            }

            reader.readAsDataURL(files[0]);
        }
        else if ((files.length > 0 && files[0].type.includes("audio"))) {
            const { doSpeechToText } = await import("../services/ai");
            const text = await doSpeechToText(files[0]);
            // const input: any = this.shadowRoot?.querySelector('fluent-text-area');
            // input.value = text;
            window.dispatchEvent(new CustomEvent('audio-dropped', {
                detail: {
                    data: text
                }
            }));
        }
    });

}