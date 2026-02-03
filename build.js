const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config();

// Read the HTML file
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Get API key from environment variable
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// Replace the placeholder API key in the HTML
if (GROQ_API_KEY) {
  html = html.replace(
    "const GROQ_API_KEY = 'gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';",
    `const GROQ_API_KEY = '${GROQ_API_KEY}';`
  );
  console.log('✓ API key injected successfully');
} else {
  console.warn('⚠ No GROQ_API_KEY found in environment variables');
  console.warn('⚠ Using placeholder key - functionality will be limited');
}

// Create dist folder if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Write the modified HTML to dist folder
fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), html);
console.log('✓ Build completed: dist/index.html created');