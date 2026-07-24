/**
 * Copia os arquivos estáticos da extensão para dist/
 * (sem bundler — suficiente para hackathon / carregar sem compactação).
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const out = path.join(root, "dist");

const FILES = [
  "manifest.json",
  "background.js",
  "content.js",
  "domain-check.js",
  "storage.js",
  "popup.html",
  "popup.js",
  "popup.css",
];

const ICON_DIR = "icons";

function rmrf(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) rmrf(p);
    else fs.unlinkSync(p);
  }
  fs.rmdirSync(dir);
}

function copyFile(rel) {
  const src = path.join(root, rel);
  const dest = path.join(out, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

rmrf(out);
fs.mkdirSync(out, { recursive: true });

for (const f of FILES) {
  if (!fs.existsSync(path.join(root, f))) {
    console.error("Arquivo ausente:", f);
    process.exit(1);
  }
  copyFile(f);
}

const iconsSrc = path.join(root, ICON_DIR);
if (fs.existsSync(iconsSrc)) {
  for (const name of fs.readdirSync(iconsSrc)) {
    copyFile(path.join(ICON_DIR, name));
  }
}

console.log("Build OK →", out);
console.log("Carregue a pasta dist/ (ou extension/) em chrome://extensions");
