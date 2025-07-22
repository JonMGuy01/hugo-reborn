// functions/api/auth.js

export async function onRequest(context) {
    const GITHUB_CLIENT_ID = context.env.GITHUB_CLIENT_ID;
    const siteUrl = context.env.CF_PAGES_URL || `https://${context.env.CF_PAGES_BRANCH}.${context.env.CF_PAGES_PROJECT_NAME}.pages.dev`;

    // The URL that GitHub will redirect back to after successful authorization.
    // This MUST exactly match the "Authorization callback URL" configured in your GitHub OAuth App.
    const REDIRECT_URI = `${siteUrl}/api/callback`; // <--- IMPORTANT: Changed to /api/callback

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo&redirect_uri=${REDIRECT_URI}`;

    return Response.redirect(githubAuthUrl, 302);
}