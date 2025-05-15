// This script runs at build time to ensure environment variables are properly handled
const fs = require("fs")
const path = require("path")

// Get the environment variables
const apiUrl = process.env.SEQ1_API_URL || "https://api.seq1.net"

// Create a public environment variables file
const envContent = `
// This file is generated at build time
// It provides fallback values for environment variables
window.__SEQ1_ENV = {
  apiUrl: "${apiUrl}",
  wsUrl: "${apiUrl.replace("https://", "wss://").replace("http://", "ws://")}",
};

// Ensure process.env is available
window.process = window.process || {};
window.process.env = window.process.env || {};

// Set environment variables
window.process.env.NEXT_PUBLIC_SEQ1_API_URL = "${apiUrl}";
`

// Create the public directory if it doesn't exist
const publicDir = path.join(process.cwd(), "public")
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir)
}

// Write the environment variables file
fs.writeFileSync(path.join(publicDir, "env.js"), envContent)

console.log("Environment variables file created successfully")
