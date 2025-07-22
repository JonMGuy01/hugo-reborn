// functions/api/callback.js

export async function onRequest(context) {
    const GITHUB_CLIENT_ID = context.env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = context.env.GITHUB_CLIENT_SECRET;
    const url = new URL(context.request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    const siteUrl = context.env.CF_PAGES_URL || `https://${context.env.CF_PAGES_BRANCH}.${context.env.CF_PAGES_PROJECT_NAME}.pages.dev`;
    const REDIRECT_URI = `${siteUrl}/api/callback`; // <--- IMPORTANT: Changed to /api/callback

    if (!code) {
        return new Response('OAuth Callback: No authorization code received. This usually means the GitHub login was cancelled or failed.', { status: 400 });
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
            console.error('GitHub OAuth Token Exchange Error:', tokenData.error_description || tokenData.error);
            return new Response(`GitHub OAuth Error: ${tokenData.error_description || tokenData.error}`, { status: 400 });
        }

        const accessToken = tokenData.access_token;

        const responseHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Login Success</title>
            </head>
            <body>
                <script>
                    const siteOrigin = "${siteUrl}"; 

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
        console.error('OAuth Callback Function Error:', error);
        return new Response(`An internal error occurred during OAuth callback: ${error.message}`, { status: 500 });
    }
}