#!/bin/bash
export NODE_ENV=production
export SEQ1_API_URL=http://127.0.0.1:5000
export NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT=903398
export NEXT_PUBLIC_BUILD_TIME=$(date -Iseconds)
export PORT=3000

echo "Environment set:"
echo "NODE_ENV: $NODE_ENV"
echo "SEQ1_API_URL: $SEQ1_API_URL"
echo "NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT: $NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT"

exec node .next/standalone/server.js
