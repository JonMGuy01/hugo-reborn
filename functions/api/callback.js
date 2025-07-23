// functions/api/callback.js

export async function onRequest(context) {
    console.log("--- NEW DEPLOYMENT: Callback function started (VERSION 3) ---"); // <--- ADD THIS LINE
    console.log("Callback function started (DEBUG MODE)."); // Keep other logs
    const GITHUB_CLIENT_ID = context.env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = context.env.GITHUB_CLIENT_SECRET;
    const url = new URL(context.request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    // This REDIRECT_URI is for GitHub's validation, and should be your custom domain
    const REDIRECT_URI = `https://theguys.online/api/callback`;

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
                redirect_uri: REDIRECT_URI,
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

        const siteOriginForPostMessage = `https://theguys.online`;

        const responseHtml = `
            <!DOCTYPE html><html><head><title>Login Success</title></head><body><script>
                const targetOrigin = "${siteOriginForPostMessage}"; 
                console.log('Attempting to postMessage to:', targetOrigin);
                console.log('Window opener exists:', !!window.opener); // Keep this log

                if (window.opener) {
                    window.opener.postMessage(
                        { type: 'github', payload: { token: '${accessToken}', provider: 'github' } },
                        targetOrigin
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