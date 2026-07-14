// ═════════════════════════════════════════════════════════════════════════════
//  optimize-bg.mjs — shrink a heavy background JPEG into web-ready assets.
//
//  This is exactly what produced the lineup assets (4.1 MB → 133 KB desktop,
//  85 KB mobile). Run it on BG_PW.jpg too — that huge hero JPEG is the main
//  reason the mobile background "takes forever to load".
//
//  SETUP (once):   npm i -D sharp
//  RUN:            node optimize-bg.mjs path/to/BG_PW.jpg
//
//  OUTPUT (next to the source):
//    <name>.opt.jpg          → optimized desktop (max 2560px wide)
//    <name>.mobile.jpg       → 9:16 portrait crop (1080×1920) for phones
//    <name>.lqip.txt         → two tiny base64 blur-up strings to paste
//
//  Then: replace your import with the .opt.jpg, add the .mobile.jpg, and paste
//  the LQIP strings where the lineup ones live (see lineup-lqip.ts).
// ═════════════════════════════════════════════════════════════════════════════

import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs/promises';

const src = process.argv[2];
if (!src) {
	console.error('Usage: node optimize-bg.mjs <image.jpg>');
	process.exit(1);
}

const dir = path.dirname(src);
const name = path.basename(src, path.extname(src));
const out = (suffix) => path.join(dir, `${name}${suffix}`);

const meta = await sharp(src).metadata();
console.log(`source: ${meta.width}×${meta.height}`);

// ── 1. Optimized desktop ─────────────────────────────────────────────────────
await sharp(src)
	.resize({ width: Math.min(2560, meta.width), withoutEnlargement: true })
	.jpeg({ quality: 78, progressive: true, mozjpeg: true })
	.toFile(out('.opt.jpg'));

// ── 2. Mobile 9:16 portrait crop (keeps the left-hand subject) ───────────────
const pw = Math.round(meta.height * (9 / 16));
await sharp(src)
	.extract({ left: 0, top: 0, width: Math.min(pw, meta.width), height: meta.height })
	.resize({ width: 1080, height: 1920, fit: 'cover' })
	.jpeg({ quality: 76, progressive: true, mozjpeg: true })
	.toFile(out('.mobile.jpg'));

// ── 3. LQIP blur-up placeholders (paste into your *-lqip.ts) ─────────────────
async function lqip(input, width) {
	const buf = await sharp(input).resize({ width }).blur(1.2).jpeg({ quality: 40 }).toBuffer();
	return `data:image/jpeg;base64,${buf.toString('base64')}`;
}
const lqipDesktop = await lqip(out('.opt.jpg'), 32);
const lqipMobile = await lqip(out('.mobile.jpg'), 24);
await fs.writeFile(
	out('.lqip.txt'),
	`DESKTOP:\n${lqipDesktop}\n\nMOBILE:\n${lqipMobile}\n`
);

const kb = async (f) => Math.round((await fs.stat(f)).size / 1024);
console.log(`desktop: ${await kb(out('.opt.jpg'))} KB  →  ${out('.opt.jpg')}`);
console.log(`mobile:  ${await kb(out('.mobile.jpg'))} KB  →  ${out('.mobile.jpg')}`);
console.log(`lqip:    ${out('.lqip.txt')}`);
