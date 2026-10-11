// Generates the app icons as PNGs with no dependencies (pure Node + zlib).
// Usage: node tools/make-icons.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'icons');
mkdirSync(out, { recursive: true });

const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = b => { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, px) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) { raw[y * (size * 4 + 1)] = 0; px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4); }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// Point-in-polygon test for a 5-point star (outer radius ro, inner radius ri), point up.
function inStar(x, y, ro, ri) {
  const pts = [];
  for (let i = 0; i < 10; i++) { const r = i % 2 ? ri : ro, a = i * Math.PI / 5 - Math.PI / 2; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Scene in unit coords (0..1). `pad` shrinks artwork into the maskable safe zone.
function shade(u, v, pad) {
  const s = 1 - 2 * pad, x = (u - 0.5) / s, y = (v - 0.5) / s; // centred, scaled
  const d = Math.hypot(x, y);
  // background: deep navy radial
  let r = 7 + 18 * Math.max(0, 1 - d * 1.4), g = 7 + 8 * Math.max(0, 1 - d * 1.4), b = 15 + 45 * Math.max(0, 1 - d * 1.4);
  const mix = (cr, cg, cb, a) => { r += (cr - r) * a; g += (cg - g) * a; b += (cb - b) * a; };
  // core glow + core
  mix(140, 90, 255, Math.max(0, 1 - d / 0.17) ** 2 * 0.9);
  if (d < 0.035) mix(235, 225, 255, 1);
  // orbit ring (dashed)
  const R = 0.3, ang = Math.atan2(y, x);
  const ringA = Math.max(0, 1 - Math.abs(d - R) / 0.012);
  if (Math.sin(ang * 18) > -0.2) mix(80, 220, 255, ringA * 0.55);
  // meteor (top-left) with tail
  const mx = -0.27, my = -0.33;
  const tailT = Math.max(0, Math.min(1, ((x - mx) * -0.63 + (y - my) * -0.77) / 0.2));
  const tx = mx + -0.63 * 0.2 * tailT, ty = my + -0.77 * 0.2 * tailT;
  const tailD = Math.hypot(x - tx, y - ty);
  mix(255, 70, 110, Math.max(0, 1 - tailD / (0.045 * (1 - tailT * 0.7))) * (1 - tailT) * 0.7);
  const md = Math.hypot(x - mx, y - my);
  mix(255, 70, 110, Math.max(0, 1 - md / 0.11) ** 2 * 0.6);
  if (md < 0.055) mix(255, 92, 130, 1);
  // gold star on ring (right)
  const sx = R * Math.cos(-0.35), sy = R * Math.sin(-0.35);
  const sd = Math.hypot(x - sx, y - sy);
  mix(255, 216, 74, Math.max(0, 1 - sd / 0.13) ** 2 * 0.45);
  if (inStar(x - sx, y - sy, 0.075, 0.032)) mix(255, 216, 74, 1);
  // player (bottom of ring) with glow + trail
  const pa = 2.05, px = R * Math.cos(pa), py = R * Math.sin(pa);
  for (let i = 1; i <= 6; i++) {
    const ta = pa - i * 0.09, td = Math.hypot(x - R * Math.cos(ta), y - R * Math.sin(ta));
    if (td < 0.05 * (1 - i / 7)) mix(79, 227, 255, 0.5 * (1 - i / 7));
  }
  const pd = Math.hypot(x - px, y - py);
  mix(79, 227, 255, Math.max(0, 1 - pd / 0.16) ** 2 * 0.8);
  if (pd < 0.058) mix(79, 227, 255, 1);
  if (pd < 0.026) mix(255, 255, 255, 1);
  return [r, g, b];
}

function render(size, pad, ss = 4) {
  const px = Buffer.alloc(size * size * 4);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    let r = 0, g = 0, b = 0;
    for (let sj = 0; sj < ss; sj++) for (let si = 0; si < ss; si++) {
      const c = shade((i + (si + 0.5) / ss) / size, (j + (sj + 0.5) / ss) / size, pad);
      r += c[0]; g += c[1]; b += c[2];
    }
    const o = (j * size + i) * 4, n = ss * ss;
    px[o] = Math.min(255, r / n); px[o + 1] = Math.min(255, g / n); px[o + 2] = Math.min(255, b / n); px[o + 3] = 255;
  }
  return png(size, px);
}

const jobs = [
  ['icon-192.png', 192, 0], ['icon-512.png', 512, 0],
  ['maskable-192.png', 192, 0.1], ['maskable-512.png', 512, 0.1],
  ['apple-touch-icon.png', 180, 0.04], ['favicon-32.png', 32, 0],
];
for (const [name, size, pad] of jobs) { writeFileSync(join(out, name), render(size, pad, size > 256 ? 3 : 4)); console.log('wrote', name); }

// ---------- 1200x630 link-preview image (WhatsApp / socials) ----------
// Tiny 5x7 pixel font, only the glyphs we need.
const FONT = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
};
// Returns a list of filled cell rects for a string at (x, y) with cell size c.
function textCells(str, x, y, c, gap = 1) {
  const cells = [];
  [...str].forEach((ch, k) => {
    const g = FONT[ch]; if (!g) return;
    g.forEach((row, j) => [...row].forEach((bit, i) => { if (bit === '1') cells.push([x + (k * (5 + gap) + i) * c, y + j * c, c]); }));
  });
  return cells;
}
const textWidth = (str, c, gap = 1) => (str.length * (5 + gap) - gap) * c;

function renderOg() {
  const OW = 1200, OH = 630, ss = 2, px = Buffer.alloc(OW * OH * 4);
  const scene = 600, sx0 = 40, sy0 = (OH - scene) / 2;           // artwork square on the left
  const big = 16, small = 6, lineGap = 30, subGap = 52;
  const blockH = 14 * big + lineGap + subGap + 7 * small, ty = Math.round((OH - blockH) / 2);
  const tx0 = 660 + Math.round((OW - 660 - 40 - textWidth('ORBIT', big)) / 2); // centred in the right column
  const layers = [
    { cells: textCells('ORBIT', tx0, ty, big), col: [232, 251, 255], glow: [79, 227, 255] },
    { cells: textCells('DASH', tx0, ty + 7 * big + lineGap, big), col: [232, 251, 255], glow: [79, 227, 255] },
    { cells: textCells('ONE TAP ARCADE', tx0, ty + 14 * big + lineGap + subGap, small), col: [255, 216, 74], glow: [255, 216, 74] },
  ];
  // bucket cells by 40px tile for fast lookups
  const tiles = new Map(), T = 40, key = (i, j) => i * 1000 + j;
  layers.forEach((L, li) => L.cells.forEach(([x, y, c]) => {
    for (let i = Math.floor((x - 30) / T); i <= Math.floor((x + c + 30) / T); i++)
      for (let j = Math.floor((y - 30) / T); j <= Math.floor((y + c + 30) / T); j++) {
        const k = key(i, j); if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push([x, y, c, li]);
      }
  }));
  for (let j = 0; j < OH; j++) for (let i = 0; i < OW; i++) {
    let r = 0, g = 0, b = 0;
    for (let sj = 0; sj < ss; sj++) for (let si = 0; si < ss; si++) {
      const X = i + (si + 0.5) / ss, Y = j + (sj + 0.5) / ss;
      let [cr, cg, cb] = shade((X - sx0) / scene, (Y - sy0) / scene, 0.02);
      const near = tiles.get(key(Math.floor(X / T), Math.floor(Y / T)));
      if (near) {
        let inside = -1, glowA = 0, glowC = null;
        for (const [x, y, c, li] of near) {
          const dx = Math.max(x - X, 0, X - (x + c)), dy = Math.max(y - Y, 0, Y - (y + c)), d = Math.hypot(dx, dy);
          if (d === 0) { inside = li; break; }
          const a = Math.max(0, 1 - d / 22) ** 2 * 0.22;
          if (a > glowA) { glowA = a; glowC = layers[li].glow; }
        }
        if (inside >= 0) [cr, cg, cb] = layers[inside].col;
        else if (glowC) { cr += (glowC[0] - cr) * glowA; cg += (glowC[1] - cg) * glowA; cb += (glowC[2] - cb) * glowA; }
      }
      r += cr; g += cg; b += cb;
    }
    const o = (j * OW + i) * 4, n = ss * ss;
    px[o] = Math.min(255, r / n); px[o + 1] = Math.min(255, g / n); px[o + 2] = Math.min(255, b / n); px[o + 3] = 255;
  }
  // png() assumes square; write a rectangular variant inline
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(OW, 0); ihdr.writeUInt32BE(OH, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(OH * (OW * 4 + 1));
  for (let y = 0; y < OH; y++) px.copy(raw, y * (OW * 4 + 1) + 1, y * OW * 4, (y + 1) * OW * 4);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
const ogPath = join(out, '..', 'og-image.png');
writeFileSync(ogPath, renderOg());
console.log('wrote og-image.png (convert to JPEG: sips -s format jpeg -s formatOptions 82 og-image.png --out og-image.jpg)');
void textWidth;
