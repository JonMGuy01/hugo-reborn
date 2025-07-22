// functions/api/callback.js

export async function onRequest(context) {
    const GITHUB_CLIENT_ID = context.env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = context.env.GITHUB_CLIENT_SECRET;
    const url = new URL(context.request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    const siteUrl = context.env.CF_PAGES_URL || `https://${context.env.CF_PAGES_BRANCH}.${context.env.CF_PAGES_PROJECT_NAME}.pages.dev`;
    const REDIRECT_URI = `${siteUrl}/api/callback`; // Points to the new /api/callback path

    if (!code) {
        return new Response('OAuth Callback: No authorization code received.', { status: 400 });
    }

    try {
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

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            console.error('OAuth Error:', tokenData.error_description || tokenData.error);
            return new Response(`OAuth Error: ${tokenData.error_description || tokenData.error}`, { status: 400 });
        }

        const accessToken = tokenData.access_token;

        // This part is for sending the token back to Decap CMS.
        // The `siteUrl` is crucial for the `postMessage` security.
        const responseHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Login Success</title>
            </head>
            <body>
                <script>
                    const siteOrigin = "${siteUrl}"; // Origin for postMessage security

                    if (window.opener) {
                        window.opener.postMessage(
                            {
                                type: 'github', // Change to 'google' if adapting for Google OAuth specifically here
                                payload: {
                                    token: '${accessToken}',
                                    provider: 'github' // Change to 'google' if adapting for Google OAuth
                                }
                            },
                            siteOrigin // This MUST match the origin of your Decap CMS admin page
                        );
                        window.close();
                    } else {
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
        console.error('OAuth Callback Error:', error);
        return new Response(`An error occurred during OAuth callback: ${error.message}`, { status: 500 });
    }
}