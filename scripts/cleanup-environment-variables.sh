#!/bin/bash
echo "🧹 SEQ1 Environment Variable Cleanup Script"
echo "=========================================="
echo "This script helps identify and guide the removal of non-canonical environment variables."
echo "It does NOT automatically delete them from your Vercel or Fly.io projects."
echo "You must manually remove them from your hosting provider's settings."
echo "It will also attempt to clean up .env.local by keeping only canonical variables."
echo ""

# Canonical variables to KEEP
CANONICAL_VARS=(
  "SEQ1_API_URL"
  "SEQ1_API_KEY"
  "NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT"
)

# Non-canonical variables to look for and guide removal from codebase/hosting
# These are the ones explicitly mentioned as redundant in the documents.
NON_CANONICAL_FOR_CODEBASE_CHECK=(
  "NEXT_PUBLIC_API_BASE_URL"
  "NEXT_PUBLIC_SEQ1_API_URL" # Legacy, likely unused
  "NEXT_PUBLIC_TRIAL_DURATION_HOURS"
  "NEXT_PUBLIC_APP_VERSION"
  "NEXT_PUBLIC_API_VERSION" # Unused
  "NEXT_PUBLIC_ENV"
  "API_BASE_URL" # Older variant
  "APP_VERSION"  # Older variant
  # Add any other old variables you know of
)

echo "🔍 Searching for non-canonical environment variable usage in the codebase (app, components, lib, pages, src)..."
FOUND_COUNT=0
for var_name in "${NON_CANONICAL_FOR_CODEBASE_CHECK[@]}"; do
  # Search for the variable name in common project directories
  # Exclude node_modules, .next, .git, public, and this script itself
  # Search in .ts, .tsx, .js, .jsx, .mjs files
  RESULTS=$(grep -rl --exclude-dir={node_modules,.next,.git,public,scripts} --include=\*.{ts,tsx,js,jsx,mjs} "$var_name" app components lib pages src 2>/dev/null || true)
  if [ -n "$RESULTS" ]; then
    echo "--------------------------------------------------"
    echo "⚠️ Found usage of '$var_name' in the following files:"
    echo "$RESULTS"
    echo "   ACTION: Please replace with canonical alternatives or remove:"
    case "$var_name" in
      "NEXT_PUBLIC_API_BASE_URL"|"API_BASE_URL"|"NEXT_PUBLIC_SEQ1_API_URL")
        echo "   -> Use 'SEQ1_API_URL' (via lib/config.ts)"
        ;;
      "NEXT_PUBLIC_TRIAL_DURATION_HOURS")
        echo "   -> Use 'TRIAL_DURATION' (hardcoded to 3, from lib/config.ts)"
        ;;
      "NEXT_PUBLIC_APP_VERSION"|"APP_VERSION")
        echo "   -> Use 'APP_VERSION_STRING' (derived from NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT, via lib/config.ts)"
        ;;
      "NEXT_PUBLIC_ENV")
        echo "   -> Use 'process.env.NODE_ENV' (e.g., 'development', 'production')"
        ;;
      *)
        echo "   -> Refer to canonical variable list and lib/config.ts."
        ;;
    esac
    echo "--------------------------------------------------"
    echo ""
    FOUND_COUNT=$((FOUND_COUNT + 1))
  fi
done

if [ "$FOUND_COUNT" -eq 0 ]; then
  echo "🎉 No non-canonical variables found in the codebase search!"
else
  echo "❗ Please review the $FOUND_COUNT instance(s) of non-canonical variable usage listed above and update your code."
fi
echo ""

echo "🧹 Checking .env.local for non-canonical variables..."
if [ -f ".env.local" ]; then
   # Create backup with timestamp
   BACKUP_FILE=".env.local.backup.$(date +%Y%m%d%H%M%S)"
   cp .env.local "$BACKUP_FILE"
   echo "   -> Backup of .env.local created as $BACKUP_FILE"
   
   TEMP_ENV_LOCAL=$(mktemp)
   
   # Keep only canonical variables and comments
   while IFS= read -r line || [ -n "$line" ]; do
     if [[ "$line" =~ ^# ]] || [[ "$line" =~ ^\s*$ ]]; then # Keep comments and empty lines
       echo "$line" >> "$TEMP_ENV_LOCAL"
     else
       var_name=$(echo "$line" | cut -d '=' -f 1)
       is_canonical=false
       for canonical_var in "${CANONICAL_VARS[@]}"; do
         if [ "$var_name" == "$canonical_var" ]; then
           is_canonical=true
           break
         fi
       done
       if [ "$is_canonical" == true ]; then
         echo "$line" >> "$TEMP_ENV_LOCAL"
       else
         echo "   -> Removing non-canonical: $line from .env.local"
       fi
     fi
   done < ".env.local"
   
   # Check if changes were made by comparing content (ignoring timestamps in filenames)
   if cmp -s "$TEMP_ENV_LOCAL" ".env.local"; then
     echo "   ✅ .env.local already contains only canonical variables, comments, or is empty."
     rm "$TEMP_ENV_LOCAL"
     # Optionally remove backup if no changes, but safer to keep it for a bit
     # rm "$BACKUP_FILE" 
   else
     mv "$TEMP_ENV_LOCAL" .env.local
     echo "   ✅ Cleaned .env.local to include only canonical variables and comments."
     echo "      Review the new .env.local. The original is backed up in $BACKUP_FILE."
   fi
else
   echo "   -> .env.local not found. No local cleanup needed for it."
fi
echo ""

echo "🌐 Reminder: Manually remove non-canonical variables from your Vercel, Fly.io, or other hosting provider's project settings:"
for var_name in "${NON_CANONICAL_FOR_CODEBASE_CHECK[@]}"; do
  # Check if it's NOT one of the canonical ones before listing for removal from hosting
  is_truly_non_canonical=true
  for canonical_var in "${CANONICAL_VARS[@]}"; do
    if [ "$var_name" == "$canonical_var" ]; then
      is_truly_non_canonical=false
      break
    fi
  done
  if [ "$is_truly_non_canonical" == true ]; then
    echo "   - $var_name"
  fi
done
echo ""
echo "✅ Cleanup guidance script finished."
echo "Manually verify changes in your codebase and hosting platforms, then test your application thoroughly."
