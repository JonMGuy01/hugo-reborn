// functions/api/callback.js

export async function onRequest(context) {
    console.log("--- NEW DEPLOYMENT: Callback function started (VERSION 6 - minimal JS test) ---"); // <--- UPDATED LOG
    console.log("Callback function started (DEBUG MODE).");
    const GITHUB_CLIENT_ID = context.env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = context.env.GITHUB_CLIENT_SECRET;
    const url = new URL(context.request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

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

        // --- SIMPLIFIED RESPONSE HTML FOR DEBUGGING ---
        const responseHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Debug Popup</title>
                <style>
                    body { font-family: sans-serif; text-align: center; padding: 20px; background-color: #f0f0f0; }
                    #status { font-size: 1.5em; margin-bottom: 10px; }
                    #openerStatus { font-weight: bold; }
                </style>
            </head>
            <body>
                <h1 id="status">Loading Debug Info...</h1>
                <p id="openerStatus"></p>
                <p>Check the browser console for details.</p>
                <button onclick="window.close()">Close Window</button>

                <script>
                    console.log('Popup script (VERSION 6) executing.');
                    const statusElement = document.getElementById('status');
                    const openerStatusElement = document.getElementById('openerStatus');

                    if (window.opener) {
                        statusElement.textContent = 'Window Opener EXISTS!';
                        openerStatusElement.textContent = 'Opener URL: ' + window.opener.location.href;
                        openerStatusElement.style.color = 'green';
                        console.log('Window opener exists:', true);
                        console.log('Window opener URL:', window.opener.location.href);
                        // No postMessage yet, just verifying opener.
                    } else {
                        statusElement.textContent = 'Window Opener IS NULL!';
                        openerStatusElement.textContent = 'The main window did not open this popup correctly.';
                        openerStatusElement.style.color = 'red';
                        console.log('Window opener exists:', false);
                    }

                    // No auto-close, user must click button.
                </script>
            </body>
            </html>
        `;
        return new Response(responseHtml, { headers: { 'Content-Type': 'text/html' } });

    } catch (error) { /* ... */ }
}