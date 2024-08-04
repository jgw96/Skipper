import MiniSearch from 'minisearch';

let miniSearch = new MiniSearch({
    fields: ['name', 'content', 'date'], // fields to index for full-text search
    storeFields: ['name', 'content', 'date'], // fields to return with search results
    extractField: (document, fieldName) => {
        if (fieldName === "content") {
            let contentString = "";
            document.content.forEach((content: any) => {
                contentString += content.content + " ";
            });
            return contentString;
        }
        else {
            return document[fieldName];
        }

    }
})

export function addDocsToSearch(convos: any[]) {
    console.log("convo saved", convos)
    miniSearch.addAll(convos);
}

export async function doSearch(searchTerm: string): Promise<any[]> {
    return new Promise((resolve) => {
        const results = miniSearch.search(searchTerm, {
            fuzzy: 0.2
        });
        resolve(results);
    })
}