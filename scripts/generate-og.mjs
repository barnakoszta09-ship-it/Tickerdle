/**
 * generate-og.mjs — converts SVG sources → production PNG assets.
 *
 * Run once (locally, not on the server) whenever the SVG designs change:
 *   node scripts/generate-og.mjs
 *
 * Then commit the generated PNGs:
 *   git add public/og-image.png public/apple-touch-icon.png public/favicon-32.png
 *   git commit -m "Regenerate OG/icon PNGs"
 *
 * Dependencies (install once):
 *   npm install --save-dev @resvg/resvg-js
 */

import { Resvg }        from '@resvg/resvg-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = resolve(__dir, '..');

function render(svgRelPath, pngRelPath, width) {
  const svgPath = resolve(root, svgRelPath);
  if (!existsSync(svgPath)) {
    console.error(`✗ Not found: ${svgRelPath}`);
    process.exit(1);
  }
  const svg = readFileSync(svgPath);
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: {
      // Load system fonts so Courier New / Courier is found on Windows/macOS
      loadSystemFonts: true,
    },
  });
  const png = resvg.render().asPng();
  writeFileSync(resolve(root, pngRelPath), png);
  console.log(`✓  ${pngRelPath}  (${width}px wide)`);
}

console.log('Generating Tickerdle PNG assets...\n');

// 1200 × 630 — Open Graph / Twitter card
render('public/og-image.svg', 'public/og-image.png', 1200);

// 180 × 180 — Apple touch icon (iOS home screen)
render('public/icon.svg', 'public/apple-touch-icon.png', 180);

// 32 × 32 — favicon PNG fallback (used by older browsers / Windows taskbar)
render('public/icon.svg', 'public/favicon-32.png', 32);

console.log('\nDone!  Commit the generated files:');
console.log('  git add public/og-image.png public/apple-touch-icon.png public/favicon-32.png');
