# Stock Resi - Deployment Instructions

## Quick Deploy to Vercel

### Method 1: Using Vercel Dashboard (Recommended - Easiest)

1. Go to https://vercel.com/new
2. Click "Continue with GitHub" (or create account if needed)
3. Install Vercel for GitHub
4. Click "Import Git Repository"
5. Paste this folder path or upload as ZIP
6. Click "Deploy"

### Method 2: Using CLI with Token

1. Get your Vercel token:
   - Go to https://vercel.com/account/tokens
   - Create a new token
   - Copy it

2. Run in terminal:
   ```
   set VERCEL_TOKEN=your_token_here
   vercel --token %VERCEL_TOKEN% --yes
   ```

### Method 3: GitHub Integration (Best for teams)

1. Install GitHub Desktop: https://desktop.github.com/
2. Create new repository on GitHub
3. Drag this folder to GitHub Desktop
4. Commit and Push
5. Go to vercel.com/new and import the repository

---

## Your App is Ready!

Once deployed, you'll get a URL like:
`https://stock-resi-xxxxx.vercel.app`

Share this URL with your team to access from any device!
