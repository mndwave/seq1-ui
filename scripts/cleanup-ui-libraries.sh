#!/bin/bash
echo "🧹 Removing non-shadcn/ui libraries for V0 compatibility..."

# Function to check and uninstall npm packages
check_and_uninstall() {
    PACKAGE_MANAGER="npm"
    # Could also check for yarn.lock or pnpm-lock.yaml if needed
    # if [ -f "yarn.lock" ]; then
    #     PACKAGE_MANAGER="yarn"
    # elif [ -f "pnpm-lock.yaml" ]; then
    #     PACKAGE_MANAGER="pnpm"
    # fi

    for pkg_pattern in "$@"; do
        # Check if the package (or pattern) is listed in package.json dependencies or devDependencies
        if grep -q "\"${pkg_pattern}\"" package.json; then
            echo "Found potentially conflicting UI library pattern: ${pkg_pattern}. Attempting uninstall..."
            if [ "$PACKAGE_MANAGER" == "npm" ]; then
                # npm uninstall can take multiple arguments
                # For patterns, we might need to be more specific or guide the user
                # This is a best-effort attempt.
                # Example: if pkg_pattern is "@chakra-ui", it might not uninstall all related packages.
                # A more robust solution would parse package.json for keys starting with the pattern.
                echo "Running: npm uninstall ${pkg_pattern} (and related if known)"
                case "$pkg_pattern" in
                    "@chakra-ui/react")
                        npm uninstall @chakra-ui/react @emotion/react @emotion/styled framer-motion
                        ;;
                    "@mui/material")
                        npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled
                        ;;
                    "antd")
                        npm uninstall antd
                        ;;
                    "react-bootstrap")
                        npm uninstall react-bootstrap bootstrap
                        ;;
                    *)
                        npm uninstall "$pkg_pattern"
                        ;;
                esac
            # Add yarn/pnpm uninstall commands if supporting them
            # elif [ "$PACKAGE_MANAGER" == "yarn" ]; then
            #     yarn remove "$pkg_pattern"
            # elif [ "$PACKAGE_MANAGER" == "pnpm" ]; then
            #     pnpm remove "$pkg_pattern"
            # fi
        else
            echo "UI library pattern not found in package.json: ${pkg_pattern}"
        fi
    done
}

# List of conflicting UI library patterns to check and remove
CONFLICTING_UI_PATTERNS=(
    "@chakra-ui/react"
    "@mui/material"
    "antd"
    "react-bootstrap"
    # Add other known conflicting libraries or patterns here
)

check_and_uninstall "${CONFLICTING_UI_PATTERNS[@]}"

echo ""
echo "✅ UI library cleanup attempt complete!"
echo "💡 Please manually verify your package.json and ensure no conflicting UI libraries remain."
echo "💡 Ensure 'components/ui/' directory contains shadcn/ui components."
echo "💡 Run: npx shadcn@latest add [component-name] to add any missing shadcn/ui components."
