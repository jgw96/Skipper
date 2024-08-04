import { AccountInfo, InteractionRequiredAuthError, PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_CLIENT_ID,
        redirectUri: location.href
    },
};

const msalInstance = new PublicClientApplication(msalConfig);
await msalInstance.initialize();

export let currentUser: any = localStorage.getItem("currentUser") ? JSON.parse(localStorage.getItem("currentUser")!) : null;

msalInstance.handleRedirectPromise().then((tokenResponse) => {
    // Check if the tokenResponse is null
    // If the tokenResponse !== null, then you are coming back from a successful authentication redirect.
    // If the tokenResponse === null, you are not coming back from an auth redirect.
    if (tokenResponse !== null) {
        const myAccounts: AccountInfo[] = msalInstance.getAllAccounts();
        console.log("my accounts", myAccounts);

        msalInstance.setActiveAccount(myAccounts[0]);

        const request = {
            scopes: ["User.Read", "Mail.ReadWrite", "Mail.Send", "Tasks.ReadWrite"],
        };

        msalInstance.acquireTokenSilent(request).then(async (tokenResponse) => {
            // Do something with the tokenResponse
            const profile = await getUserProfile(tokenResponse.accessToken);
            console.log("profile", profile);

            if (currentUser === null) {
                currentUser = profile;
                localStorage.setItem("currentUser", JSON.stringify(currentUser));
            }

            localStorage.setItem("accessToken", tokenResponse.accessToken);

            await checkForDefaultListFirst(tokenResponse.accessToken);
        }).catch(async (error: any) => {
            console.log("Silent token acquisition fails. Acquiring token using redirect", error)
            if (error instanceof InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                const tokenResponse: any = await msalInstance.acquireTokenRedirect(request);
                console.log("tokenResponse", tokenResponse.accessToken);

                localStorage.setItem("accessToken", tokenResponse.accessToken);

                const profile = await getUserProfile(tokenResponse.accessToken);
                console.log("profile", profile);

                if (currentUser === null) {
                    currentUser = profile;
                    localStorage.setItem("currentUser", JSON.stringify(currentUser));
                }

                await checkForDefaultListFirst(tokenResponse.accessToken);
            }


            // handle other errors
        });

    }
}).catch((error) => {
    // handle error, either in the library or coming back from the server
    console.error("Auth Error", error);
});

export const signIn = async () => {
    const loginRequest = {
        scopes: ["user.read", "mail.readwrite", "mail.send", "tasks.readwrite"], // optional Array<string>
    };

    try {
        msalInstance.loginRedirect(loginRequest);
    } catch (err) {
        // handle error
    }
}

export const logOut = async () => {
    const logoutRequest = {
        account: msalInstance.getActiveAccount()
    };

    try {
        msalInstance.logoutRedirect(logoutRequest);
    } catch (err) {
        // handle error
    }

}

export const getUserProfile = (accessToken: string) => {
    return new Promise((resolve) => {
        const headers = new Headers();
        const bearer = "Bearer " + accessToken;
        headers.append("Authorization", bearer);
        const options = {
            method: "GET",
            headers: headers
        };
        const graphEndpoint = "https://graph.microsoft.com/v1.0/me";

        fetch(graphEndpoint, options)
            .then(resp => {
                resp.json().then((data) => {
                    //do something with response
                    if (currentUser === null) {
                        currentUser = data;
                        localStorage.setItem("currentUser", JSON.stringify(currentUser));
                    }

                    resolve(data);
                });
            });
    })
}

export const getUserPhoto = (accessToken: string): Promise<Blob> => {
    return new Promise((resolve) => {
        const headers = new Headers();
        const bearer = "Bearer " + accessToken;
        headers.append("Authorization", bearer);
        const options = {
            method: "GET",
            headers: headers
        };
        const graphEndpoint = "https://graph.microsoft.com/v1.0/me/photo/$value";

        fetch(graphEndpoint, options)
            .then(resp => {
                //do something with response
                resolve(resp.blob());
            });
    })
}

export async function setUpDefaultTaskList(msAuthToken: string) {
    const response = await fetch("https://graph.microsoft.com/v1.0/me/todo/lists", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${msAuthToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            displayName: "Skipper"
        })
    });

    const jsonData = await response.json();

    localStorage.setItem("taskListID", jsonData.id);
    return jsonData;
}

async function checkForDefaultListFirst(msAuthToken: string) {
    const response = await fetch("https://graph.microsoft.com/v1.0/me/todo/lists", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${msAuthToken}`,
            "Content-Type": "application/json"
        }
    });

    const jsonData = await response.json();
    const skipperList = jsonData.value.find((list: any) => list.displayName === "Skipper");

    if (!skipperList) {
        await setUpDefaultTaskList(msAuthToken!);
    }
}
