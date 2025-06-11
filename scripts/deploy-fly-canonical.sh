#!/bin/bash
echo "🚀 Deploying to Fly.io with canonical environment variables..."

# Validate API key argument
if [ -z "$1" ]; then
    echo "❌ Error: Please provide API key as first argument"
    echo "Usage: ./scripts/deploy-fly-canonical.sh your-api-key"
    exit 1
fi

# Set canonical secrets in Fly.io
# Ensure these are the exact names your Fly app expects.
# Replace 'your-fly-app-name' with your actual Fly app name if different.
APP_NAME="seq1-ui" # Or your actual Fly app name

fly secrets set SEQ1_API_URL=https://api.seq1.net --app $APP_NAME
fly secrets set SEQ1_API_KEY=$1 --app $APP_NAME
fly secrets set NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT=899175 --app $APP_NAME # This will be available at build time

echo "Secrets set for app '$APP_NAME'. Deploying..."
# Deploy
fly deploy --app $APP_NAME

echo "✅ Canonical deployment complete for $APP_NAME!"
echo "ℹ️ Note: If your Fly app name is different from '$APP_NAME', please update the APP_NAME variable in this script."
