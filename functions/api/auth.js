// functions/api/auth.js

export async function onRequest(context) {
    const GITHUB_CLIENT_ID = context.env.GITHUB_CLIENT_ID;

    // Dynamically determine the site's base URL (custom domain or pages.dev)
    const siteUrl = context.env.CF_PAGES_URL || `https://${context.env.CF_PAGES_BRANCH}.${context.env.CF_PAGES_PROJECT_NAME}.pages.dev`;

    // This is the URL GitHub will redirect back to after authorization.
    // It must match what's set in your GitHub OAuth App settings.
    const REDIRECT_URI = `${siteUrl}/api/callback`; // Points to the new /api/callback path

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo&redirect_uri=${REDIRECT_URI}`;

    return Response.redirect(githubAuthUrl, 302);
}