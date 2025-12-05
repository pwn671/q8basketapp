// Simple icon generator script
// This creates placeholder icons - replace with actual app icons

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconSizes = [48, 72, 96, 144, 192, 256, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a simple SVG icon template
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#d32f2f"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial, sans-serif" font-size="${size/4}" font-weight="bold">Q8</text>
</svg>`;

// Generate SVG icons (you'll need to convert these to PNG)
iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.svg`), svgContent);
});

console.log('Generated SVG icons. Convert to PNG using an online converter or image editor.');
console.log('Required PNG sizes:', iconSizes.join(', '));
