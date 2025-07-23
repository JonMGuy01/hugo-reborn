// functions/api/callback.js

export async function onRequest(context) {
    console.log("Callback function started (DEBUG MODE).");
    const url = new URL(context.request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    console.log(`Callback Code: ${code}`);
    console.log(`Callback State: ${state}`);

    if (!code) {
        console.error('Callback: No authorization code received.');
        return new Response('OAuth Callback: No authorization code received.', { status: 400 });
    }

    try {
        // --- TEMPORARILY COMMENTING OUT GITHUB TOKEN EXCHANGE ---
        // This will allow us to see if the function itself can run without crashing on the fetch.

        // const GITHUB_CLIENT_ID = context.env.GITHUB_CLIENT_ID;
        // const GITHUB_CLIENT_SECRET = context.env.GITHUB_CLIENT_SECRET;
        // const siteUrl = context.env.CF_PAGES_URL || `https://${context.env.CF_PAGES_BRANCH}.${context.env.CF_PAGES_PROJECT_NAME}.pages.dev`;
        // const REDIRECT_URI = `${siteUrl}/api/callback`; 

        // console.log('Attempting to exchange code for access token with GitHub...');
        // const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Accept': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         client_id: GITHUB_CLIENT_ID,
        //         client_secret: GITHUB_CLIENT_SECRET,
        //         code: code,
        //         redirect_uri: REDIRECT_URI,
        //         state: state
        //     })
        // });

        // console.log(`GitHub token exchange response status: ${tokenResponse.status}`); 
        // if (!tokenResponse.ok) {
        //     const errorText = await tokenResponse.text();
        //     console.error(`GitHub token exchange non-OK response: ${tokenResponse.status} - ${errorText}`);
        //     return new Response(`GitHub token exchange failed: ${tokenResponse.status} - ${errorText}`, { status: tokenResponse.status });
        // }

        // const tokenData = await tokenResponse.json();
        // console.log('GitHub token exchange response JSON:', JSON.stringify(tokenData)); 

        // if (tokenData.error) {
        //     console.error('GitHub OAuth Token Exchange Error:', tokenData.error_description || tokenData.error);
        //     return new Response(`GitHub OAuth Error: ${tokenData.error_description || tokenData.error}`, { status: 400 });
        // }

        // const accessToken = tokenData.access_token;
        // if (!accessToken) {
        //     console.error('GitHub OAuth: Access token not found in response.');
        //     return new Response('GitHub OAuth: Access token not found in response.', { status: 500 });
        // }
        // console.log('Access token successfully retrieved.'); 

        // --- END TEMPORARY COMMENT OUT ---

        // --- Return a simple success message for now ---
        console.log("Returning dummy success response from callback function.");
        return new Response(`
            <!DOCTYPE html>
            <html>
            <head><title>Callback Test</title></head>
            <body>
                <h1>Callback Function Reached!</h1>
                <p>Code: ${code}</p>
                <p>State: ${state}</p>
                <p>This means the function is working up to the point of fetching the token.</p>
                <script>
                    // Close the popup after a short delay
                    setTimeout(() => {
                        if (window.opener) {
                            window.close();
                        }
                    }, 1000); // Close after 1 second
                </script>
            </body>
            </html>
        `, {
            headers: { 'Content-Type': 'text/html' }
        });

    } catch (error) {
        console.error('OAuth Callback Function caught unhandled error (DEBUG MODE):', error.message, error.stack);
        return new Response(`An internal error occurred during OAuth callback (DEBUG MODE): ${error.message}`, { status: 500 });
    }
}