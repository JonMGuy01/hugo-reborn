// functions/api/auth.js

// This function is executed when a request is made to /api/auth
export async function onRequest(context) {
    // Retrieve the GitHub Client ID from Cloudflare Pages Environment Variables
    const GITHUB_CLIENT_ID = context.env.GITHUB_CLIENT_ID;

    // Dynamically determine the site's base URL (custom domain or pages.dev)
    // This ensures the redirect_uri is correct whether you're using hugo-reborn.pages.dev or a custom domain.
    const siteUrl = context.env.CF_PAGES_URL || `https://${context.env.CF_PAGES_BRANCH}.${context.env.CF_PAGES_PROJECT_NAME}.pages.dev`;

    // The URL that GitHub will redirect back to after successful authorization.
    // This MUST exactly match the "Authorization callback URL" configured in your GitHub OAuth App.
    const REDIRECT_URI = `${siteUrl}/api/callback`; // Points to your functions/api/callback.js

    // Construct the GitHub authorization URL
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo&redirect_uri=${REDIRECT_URI}`;

    // Redirect the user's browser to GitHub's authorization page
    return Response.redirect(githubAuthUrl, 302);
}