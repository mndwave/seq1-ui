#!/bin/bash
echo "🚀 Deploying to Vercel with canonical environment variables..."

# These commands will prompt you for the value if adding for the first time for "production" environment.
# For subsequent deployments, they will be used if already set.

echo "Setting SEQ1_API_URL for production..."
vercel env add SEQ1_API_URL production
# You will be prompted to enter the value for SEQ1_API_URL. Default: https://api.seq1.net

echo "Setting SEQ1_API_KEY for production..."
vercel env add SEQ1_API_KEY production
# You will be prompted to enter your secret API key.

echo "Setting NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT for production..."
vercel env add NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT production
# You will be prompted to enter the value for NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT. Default: 899175

echo "Environment variables configured. Deploying to production..."
# Deploy to production
vercel --prod

echo "✅ Canonical deployment to Vercel complete!"
