import { AccountInfo, InteractionRequiredAuthError, PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
    auth: {
        clientId: '385ccfbf-05e4-4f18-8e83-2e0ce7d3c636',
        redirectUri: 'http://localhost:3002/'
    },
};

const msalInstance = new PublicClientApplication(msalConfig);
await msalInstance.initialize();

msalInstance.handleRedirectPromise().then((tokenResponse) => {
    // Check if the tokenResponse is null
    // If the tokenResponse !== null, then you are coming back from a successful authentication redirect.
    // If the tokenResponse === null, you are not coming back from an auth redirect.
    if (tokenResponse !== null) {
        const myAccounts: AccountInfo[] = msalInstance.getAllAccounts();
        console.log("my accounts", myAccounts);

        msalInstance.setActiveAccount(myAccounts[0]);

        var request = {
            scopes: ["User.Read", "Mail.ReadBasic"],
        };

        msalInstance.acquireTokenSilent(request).then(async (tokenResponse) => {
            // Do something with the tokenResponse
            console.log("tokenResponse", tokenResponse.accessToken);
            const profile = await getUserProfile(tokenResponse.accessToken);
            console.log("profile", profile);

            localStorage.setItem("accessToken", tokenResponse.accessToken);
        }).catch(async (error: any) => {
            console.log("Silent token acquisition fails. Acquiring token using redirect", error)
            if (error instanceof InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                const tokenResponse: any = await msalInstance.acquireTokenRedirect(request);
                console.log("tokenResponse", tokenResponse.accessToken);

                localStorage.setItem("accessToken", tokenResponse.accessToken);

                const profile = await getUserProfile(tokenResponse.accessToken);
                console.log("profile", profile);
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
        scopes: ["user.read", "mail.send"], // optional Array<string>
    };

    try {
        msalInstance.loginRedirect(loginRequest);
    } catch (err) {
        // handle error
    }
}

export const getUserProfile = (accessToken: string) => {
    return new Promise((resolve, reject) => {
        const headers = new Headers();
        const bearer = "Bearer " + accessToken;
        headers.append("Authorization", bearer);
        var options = {
            method: "GET",
            headers: headers
        };
        const graphEndpoint = "https://graph.microsoft.com/v1.0/me";

        fetch(graphEndpoint, options)
            .then(resp => {
                //do something with response
                resolve(resp.json());
            });
    })
}