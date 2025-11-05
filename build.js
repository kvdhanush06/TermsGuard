const fs = require('fs');
const path = require('path');
require('dotenv').config();

const envKey = process.env.GROQ_API_KEY;
if (!envKey) {
  console.error('GROQ_API_KEY not found in .env');
  process.exit(1);
}

const srcDir = __dirname;
const distDir = path.join(__dirname, 'dist');

// Create dist dir
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy static files
const staticFiles = ['manifest.json', 'popup.html'];
staticFiles.forEach(file => {
  fs.copyFileSync(path.join(srcDir, file), path.join(distDir, file));
});

// Process JS files
const jsFiles = ['background.js', 'content.js', 'popup.js'];
jsFiles.forEach(file => {
  let content = fs.readFileSync(path.join(srcDir, file), 'utf8');
  content = content.replace(/process\.env\.GROQ_API_KEY/g, `'${envKey}'`);
  fs.writeFileSync(path.join(distDir, file), content);
});

console.log('Build completed successfully!');