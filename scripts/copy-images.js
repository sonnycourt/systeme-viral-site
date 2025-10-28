#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer le dossier dist/media s'il n'existe pas
const distMediaDir = path.join(__dirname, '../dist/media');
if (!fs.existsSync(distMediaDir)) {
  fs.mkdirSync(distMediaDir, { recursive: true });
}

// Copier toutes les images du dossier public/media vers dist/media
const publicMediaDir = path.join(__dirname, '../public/media');
const files = fs.readdirSync(publicMediaDir);

files.forEach(file => {
  if (file.endsWith('.webp') || file.endsWith('.svg') || file.endsWith('.png') || file.endsWith('.jpg')) {
    const srcPath = path.join(publicMediaDir, file);
    const destPath = path.join(distMediaDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied: ${file}`);
  }
});

console.log('All images copied to dist/media');
