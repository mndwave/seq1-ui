// This script runs at build time to ensure environment variables are properly handled
const fs = require("fs")
const path = require("path")

// Check if .env file exists
const envPath = path.join(__dirname, "..", ".env")
if (!fs.existsSync(envPath)) {
  // Create .env file with default values
  const envContent = `
# API Configuration
SEQ1_API_URL=https://api.seq1.net
SEQ1_API_KEY=your_api_key_here

# Other Configuration
NODE_ENV=development
  `.trim()

  fs.writeFileSync(envPath, envContent)
  console.log("Created .env file with default values")
} else {
  console.log(".env file already exists")
}

// Check if .env file contains SEQ1_API_URL
const envContent = fs.readFileSync(envPath, "utf8")
if (!envContent.includes("SEQ1_API_URL=")) {
  // Add SEQ1_API_URL to .env file
  const newEnvContent = envContent + "\n\n# API Configuration\nSEQ1_API_URL=https://api.seq1.net\n"
  fs.writeFileSync(envPath, newEnvContent)
  console.log("Added SEQ1_API_URL to .env file")
}

// Get the environment variables
const apiUrl = process.env.SEQ1_API_URL || "https://api.seq1.net"

// Create a public environment variables file
const publicEnvContent = `
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
window.process.env.SEQ1_API_URL = "${apiUrl}";
`

// Create the public directory if it doesn't exist
const publicDir = path.join(process.cwd(), "public")
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir)
}

// Write the environment variables file
fs.writeFileSync(path.join(publicDir, "env.js"), publicEnvContent)

console.log("Environment variables file created successfully")
console.log("Environment setup complete")
