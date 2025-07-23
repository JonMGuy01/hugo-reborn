// functions/api/callback.js

export async function onRequest(context) {
    console.log("Callback function started."); // Log start
    const GITHUB_CLIENT_ID = context.env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = context.env.GITHUB_CLIENT_SECRET;
    const url = new URL(context.request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    const siteUrl = context.env.CF_PAGES_URL || `https://${context.env.CF_PAGES_BRANCH}.${context.env.CF_PAGES_PROJECT_NAME}.pages.dev`;
    const REDIRECT_URI = `${siteUrl}/api/callback`; // Ensure this matches your GitHub OAuth config

    console.log(`Callback REDIRECT_URI: ${REDIRECT_URI}`); // Log redirect_uri
    console.log(`Callback Code: ${code}`); // Log received code
    console.log(`Callback State: ${state}`); // Log received state

    if (!code) {
        console.error('Callback: No authorization code received.');
        return new Response('OAuth Callback: No authorization code received.', { status: 400 });
    }

    try {
        console.log('Attempting to exchange code for access token with GitHub...');
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code: code,
                redirect_uri: REDIRECT_URI,
                state: state
            })
        });

        console.log(`GitHub token exchange response status: ${tokenResponse.status}`); // Log response status

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text(); // Get raw text for debugging
            console.error(`GitHub token exchange non-OK response: ${tokenResponse.status} - ${errorText}`);
            return new Response(`GitHub token exchange failed: ${tokenResponse.status} - ${errorText}`, { status: tokenResponse.status });
        }

        const tokenData = await tokenResponse.json();
        console.log('GitHub token exchange response JSON:', JSON.stringify(tokenData)); // Log full JSON response

        if (tokenData.error) {
            console.error('GitHub OAuth Token Exchange Error:', tokenData.error_description || tokenData.error);
            return new Response(`GitHub OAuth Error: ${tokenData.error_description || tokenData.error}`, { status: 400 });
        }

        const accessToken = tokenData.access_token;
        if (!accessToken) {
            console.error('GitHub OAuth: Access token not found in response.');
            return new Response('GitHub OAuth: Access token not found in response.', { status: 500 });
        }
        console.log('Access token successfully retrieved.'); // Confirm token retrieval

        const responseHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Login Success</title>
            </head>
            <body>
                <script>
                    const siteOrigin = "${siteUrl}"; 
                    console.log('Attempting to postMessage to:', siteOrigin); // Log postMessage target

                    if (window.opener) {
                        window.opener.postMessage(
                            {
                                type: 'github',
                                payload: {
                                    token: '${accessToken}',
                                    provider: 'github'
                                }
                            },
                            siteOrigin 
                        );
                        console.log('PostMessage sent. Closing window.'); // Log postMessage sent
                        window.close();
                    } else {
                        console.log('No window.opener. Displaying fallback.');
                        document.body.innerHTML = '<h1>Login Successful!</h1><p>You can close this window now.</p>';
                    }
                </script>
                <p>Logging in...</p>
            </body>
            </html>
        `;

        return new Response(responseHtml, {
            headers: { 'Content-Type': 'text/html' }
        });

    } catch (error) {
        console.error('OAuth Callback Function caught unhandled error:', error.message, error.stack); // Log full error
        return new Response(`An internal error occurred during OAuth callback: ${error.message}`, { status: 500 });
    }
}