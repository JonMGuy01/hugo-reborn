// functions/api/auth.js

export async function onRequest(context) {
    const GITHUB_CLIENT_ID = context.env.GITHUB_CLIENT_ID;
    // const siteUrl = context.env.CF_PAGES_URL || `https://${context.env.CF_PAGES_BRANCH}.${context.env.CF_PAGES_PROJECT_NAME}.pages.dev`; // <-- Comment out or remove this line

    // IMPORTANT: Hardcode your custom domain for the redirect_uri
    const REDIRECT_URI = `https://theguys.online/api/callback`; // <--- Use your actual custom domain here

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo&redirect_uri=${REDIRECT_URI}`;

    return Response.redirect(githubAuthUrl, 302);
}