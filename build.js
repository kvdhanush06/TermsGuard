const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const srcDir = path.join(__dirname, 'extension');
const distDir = path.join(__dirname, 'dist');

function copyRecursiveSync(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isFile()) {
    fs.copyFileSync(src, dest);
    return;
  }

  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const childItemName of fs.readdirSync(src)) {
    copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
  }
}

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy the extension exactly as authored. Server-side API keys must never be
// embedded into JavaScript distributed to end users.
copyRecursiveSync(srcDir, distDir);

const manifestPath = path.join(distDir, 'manifest.json');
let version = '0.0.0';
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    version = manifest.version || version;
  } catch (error) {
    console.warn('Could not read manifest.json to determine version; using 0.0.0.');
  }
}

const zipName = `termsguard-extension-v${version}.zip`;
const zipPath = path.join(__dirname, zipName);
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

const zip = new AdmZip();
zip.addLocalFolder(distDir, '');
zip.writeZip(zipPath);

console.log(`Build completed successfully! Created ${zipName}`);
