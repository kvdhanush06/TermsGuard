const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
require('dotenv').config();

const envKey = process.env.GROQ_API_KEY || null;
if (!envKey) {
  console.warn('No GROQ_API_KEY provided; build will not inject a key. Use the extension Options page at runtime instead.');
}

const srcDir = path.join(__dirname, 'extension');
const distDir = path.join(__dirname, 'dist');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isFile = exists && stats.isFile();
  if (isFile) {
    fs.copyFileSync(src, dest);
  } else {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  }
}

// Clean/create dist dir
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

// Copy extension folder into dist
copyRecursiveSync(srcDir, distDir);

// Replace process.env occurrences in JS files in dist
function replaceEnvInFiles(dir) {
  const items = fs.readdirSync(dir);
  items.forEach((item) => {
    const full = path.join(dir, item);
    const stats = fs.statSync(full);
    if (stats.isDirectory()) return replaceEnvInFiles(full);
    if (stats.isFile() && full.endsWith('.js') && envKey) {
      let content = fs.readFileSync(full, 'utf8');
      if (content.includes("process.env.GROQ_API_KEY")) {
        content = content.replace(/process\.env\.GROQ_API_KEY/g, `'${envKey}'`);
        fs.writeFileSync(full, content, 'utf8');
        console.log(`Injected GROQ_API_KEY into ${full}`);
      }
    }
  });
}

replaceEnvInFiles(distDir);

// Read manifest version
const manifestPath = path.join(distDir, 'manifest.json');
let version = '0.0.0';
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    version = manifest.version || version;
  } catch (e) {
    console.warn('Could not read manifest.json to determine version, using 0.0.0');
  }
}

// Create a zip artifact with the extension files at the root of the zip
const zipName = `termsguard-extension-v${version}.zip`;
const zipPath = path.join(__dirname, zipName);
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
const zip = new AdmZip();
zip.addLocalFolder(distDir, '');
zip.writeZip(zipPath);

console.log(`Build completed successfully! Created ${zipName}`);