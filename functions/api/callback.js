// functions/api/callback.js
export async function onRequest(context) {
    const GITHUB_CLIENT_ID = context.env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = context.env.GITHUB_CLIENT_SECRET;
    const url = new URL(context.request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const siteUrl = context.env.CF_PAGES_URL || `https://${context.env.CF_PAGES_BRANCH}.${context.env.CF_PAGES_PROJECT_NAME}.pages.dev`;
    const REDIRECT_URI = `${siteUrl}/api/callback`; // <--- IMPORTANT: Changed to /api/callback

    if (!code) { /* ... error handling ... */ }
    try { /* ... token exchange ... */ } catch (error) { /* ... error handling ... */ }

    const accessToken = tokenData.access_token;
    const responseHtml = `
        <!DOCTYPE html><html><head><title>Login Success</title></head><body><script>
            const siteOrigin = "${siteUrl}"; 
            if (window.opener) {
                window.opener.postMessage({ type: 'github', payload: { token: '${accessToken}', provider: 'github' } }, siteOrigin);
                window.close();
            } else {
                document.body.innerHTML = '<h1>Login Successful!</h1><p>You can close this window now.</p>';
            }
        </script><p>Logging in...</p></body></html>
    `;
    return new Response(responseHtml, { headers: { 'Content-Type': 'text/html' } });
}