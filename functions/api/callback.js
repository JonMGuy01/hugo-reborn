// functions/api/callback.js

export async function onRequest(context) {
    console.log("Callback function started (DEBUG MODE)."); // Keep debug logs for now
    const GITHUB_CLIENT_ID = context.env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = context.env.GITHUB_CLIENT_SECRET;
    const url = new URL(context.request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    // const siteUrl = context.env.CF_PAGES_URL || `https://${context.env.CF_PAGES_BRANCH}.${context.env.CF_PAGES_PROJECT_NAME}.pages.dev`; // <-- Comment out or remove this line
    // IMPORTANT: Hardcode your custom domain for the redirect_uri
    const REDIRECT_URI = `https://theguys.online/api/callback`; // <--- Use your actual custom domain here

    console.log(`Callback REDIRECT_URI: ${REDIRECT_URI}`);
    console.log(`Callback Code: ${code}`);
    console.log(`Callback State: ${state}`);

    if (!code) { /* ... */ }

    try {
        console.log('Attempting to exchange code for access token with GitHub...');
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code: code,
                redirect_uri: REDIRECT_URI, // Use the hardcoded REDIRECT_URI
                state: state
            })
        });

        console.log(`GitHub token exchange response status: ${tokenResponse.status}`);
        if (!tokenResponse.ok) { /* ... */ }
        const tokenData = await tokenResponse.json();
        console.log('GitHub token exchange response JSON:', JSON.stringify(tokenData));

        if (tokenData.error) { /* ... */ }
        const accessToken = tokenData.access_token;
        if (!accessToken) { /* ... */ }
        console.log('Access token successfully retrieved.');

        // IMPORTANT: Ensure siteOrigin for postMessage also uses your custom domain
        const siteOrigin = `https://theguys.online`; // <--- Use your actual custom domain here

        const responseHtml = `
            <!DOCTYPE html><html><head><title>Login Success</title></head><body><script>
                const siteOrigin = "${siteOrigin}"; // Use the hardcoded siteOrigin
                console.log('Attempting to postMessage to:', siteOrigin);

                if (window.opener) {
                    window.opener.postMessage(
                        { type: 'github', payload: { token: '${accessToken}', provider: 'github' } },
                        siteOrigin
                    );
                    console.log('PostMessage sent. Closing window.');
                    window.close();
                } else {
                    console.log('No window.opener. Displaying fallback.');
                    document.body.innerHTML = '<h1>Login Successful!</h1><p>You can close this window now.</p>';
                }
            </script><p>Logging in...</p></body></html>
        `;
        return new Response(responseHtml, { headers: { 'Content-Type': 'text/html' } });

    } catch (error) { /* ... */ }
}