export async function listTodoLists() {
    const msAuthToken = localStorage.getItem("accessToken");
    const response = await fetch("https://graph.microsoft.com/v1.0/me/todo/lists", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${msAuthToken}`,
            "Content-Type": "application/json"
        }
    });

    return await response.json();
}