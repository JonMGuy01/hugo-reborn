// functions/api/callback.js

// This function is executed when a request is made to /api/callback
export async function onRequest(context) {
    // Retrieve GitHub credentials from Cloudflare Pages Environment Variables
    const GITHUB_CLIENT_ID = context.env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = context.env.GITHUB_CLIENT_SECRET;

    // Parse the incoming request URL to get the authorization code and state
    const url = new URL(context.request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    // Dynamically determine the site's base URL for the redirect_uri
    const siteUrl = context.env.CF_PAGES_URL || `https://${context.env.CF_PAGES_BRANCH}.${context.env.CF_PAGES_PROJECT_NAME}.pages.dev`;
    const REDIRECT_URI = `${siteUrl}/api/callback`; // This must match your GitHub OAuth App's callback URL

    // If no code is received, something went wrong (e.g., user cancelled login)
    if (!code) {
        return new Response('OAuth Callback: No authorization code received. This usually means the GitHub login was cancelled or failed.', { status: 400 });
    }

    try {
        // Exchange the authorization code for an access token with GitHub
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json' // GitHub prefers this for JSON response
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code: code,
                redirect_uri: REDIRECT_URI,
                state: state // Pass the state parameter back for security (CSRF protection)
            })
        });

        const tokenData = await tokenResponse.json();

        // Check for errors from GitHub's token exchange API
        if (tokenData.error) {
            console.error('GitHub OAuth Token Exchange Error:', tokenData.error_description || tokenData.error);
            return new Response(`GitHub OAuth Error: ${tokenData.error_description || tokenData.error}`, { status: 400 });
        }

        const accessToken = tokenData.access_token;

        // This is the critical part: sending the token back to Decap CMS.
        // Decap CMS expects this from the popup window via window.opener.postMessage.
        const responseHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Login Success</title>
            </head>
            <body>
                <script>
                    // The origin of your Decap CMS admin page (e.g., "https://hugo-reborn.pages.dev")
                    const siteOrigin = "${siteUrl}"; 

                    if (window.opener) {
                        // Send the token and provider type to the main CMS window
                        window.opener.postMessage(
                            {
                                type: 'github', // Indicates the OAuth provider
                                payload: {
                                    token: '${accessToken}',
                                    provider: 'github'
                                }
                            },
                            siteOrigin // IMPORTANT SECURITY: This MUST be the exact origin of your Decap CMS admin page
                        );
                        window.close(); // Close the popup window after sending the message
                    } else {
                        // Fallback for direct access to the callback URL (e.g., if testing directly)
                        document.body.innerHTML = '<h1>Login Successful!</h1><p>You can close this window now.</p>';
                    }
                </script>
                <p>Logging in...</p>
            </body>
            </html>
        `;

        // Return the HTML response to the browser
        return new Response(responseHtml, {
            headers: { 'Content-Type': 'text/html' }
        });

    } catch (error) {
        // Catch any unexpected errors during the function execution
        console.error('OAuth Callback Function Error:', error);
        return new Response(`An internal error occurred during OAuth callback: ${error.message}`, { status: 500 });
    }
}