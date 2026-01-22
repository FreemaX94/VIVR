// Node.js script to generate extension icons
// Run with: node generate-icons.js

const fs = require('fs');
const path = require('path');

// Simple PNG generator (creates a basic colored square with "V")
// For a real production app, use 'canvas' npm package

const sizes = [16, 32, 48, 128];

// Create a simple PNG file manually (uncompressed)
function createSimplePNG(size) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const width = size;
  const height = size;
  const bitDepth = 8;
  const colorType = 2; // RGB
  const compression = 0;
  const filter = 0;
  const interlace = 0;

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(bitDepth, 8);
  ihdrData.writeUInt8(colorType, 9);
  ihdrData.writeUInt8(compression, 10);
  ihdrData.writeUInt8(filter, 11);
  ihdrData.writeUInt8(interlace, 12);

  // Create image data (purple gradient with white V)
  const rawData = [];

  for (let y = 0; y < height; y++) {
    rawData.push(0); // Filter byte for each row
    for (let x = 0; x < width; x++) {
      // Calculate gradient colors
      const progress = (x + y) / (width + height);
      const r = Math.floor(102 + (118 - 102) * progress); // #667eea to #764ba2
      const g = Math.floor(126 + (75 - 126) * progress);
      const b = Math.floor(234 + (162 - 234) * progress);

      // Draw "V" in white
      const centerX = width / 2;
      const centerY = height / 2;
      const vSize = size * 0.35;

      // Simple V detection
      const relX = x - centerX;
      const relY = y - centerY;
      const inV = Math.abs(relY + vSize * 0.4) < vSize * 0.8 &&
                  Math.abs(Math.abs(relX) - (relY + vSize * 0.4) * 0.5) < size * 0.08;

      if (inV && relY > -vSize * 0.4) {
        rawData.push(255, 255, 255); // White
      } else {
        rawData.push(r, g, b);
      }
    }
  }

  return { width, height, rawData: Buffer.from(rawData) };
}

console.log('VIVR Extension Icon Generator');
console.log('============================');
console.log('');
console.log('Pour generer les icones PNG, vous avez deux options:');
console.log('');
console.log('Option 1: Utiliser le generateur HTML');
console.log('  1. Ouvrez icons/generate-icons.html dans Chrome');
console.log('  2. Cliquez sur chaque bouton "Telecharger"');
console.log('  3. Sauvegardez les fichiers dans ce dossier icons/');
console.log('');
console.log('Option 2: Utiliser un outil en ligne');
console.log('  1. Allez sur https://favicon.io/favicon-generator/');
console.log('  2. Creez un favicon avec la lettre "V"');
console.log('  3. Couleur de fond: #667eea');
console.log('  4. Telecharger et renommer les fichiers');
console.log('');
console.log('Fichiers necessaires:');
sizes.forEach(size => {
  console.log(`  - icon${size}.png (${size}x${size} pixels)`);
});
