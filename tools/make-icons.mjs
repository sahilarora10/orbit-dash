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
