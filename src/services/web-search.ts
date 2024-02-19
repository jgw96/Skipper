const key = "c64cc3d508684121b48ac0dde932cb85";

export async function searchBing(searchTerm: string) {
    const response = await fetch("https://api.bing.microsoft.com/v7.0/search?q=" + searchTerm, {
        headers: {
            "Ocp-Apim-Subscription-Key": key,
            "Accept": "application/json"
        }
    });

    const data = await response.json();

    return data;
}