/**
 * Generates NativeImage objects for the Windows thumbnail toolbar
 * using pure Node.js (zlib) - no external deps, no binary asset files.
 */
const zlib = require('zlib');
const { nativeImage } = require('electron');

// ─── CRC32 (required by PNG spec) ────────────────────────────────────────────
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// ─── PNG chunk builder ────────────────────────────────────────────────────────
function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.allocUnsafe(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), 0);
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
}

// ─── Build a valid RGBA PNG from a flat pixel buffer ─────────────────────────
function buildPNG(width, height, pixels) {
  // IHDR
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // colour type: RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw scanlines (filter byte 0 = None, then RGBA per pixel)
  const rowBytes = width * 4;
  const raw = Buffer.allocUnsafe((1 + rowBytes) * height);
  for (let y = 0; y < height; y++) {
    raw[(1 + rowBytes) * y] = 0; // filter type None
    pixels.copy(raw, (1 + rowBytes) * y + 1, y * rowBytes, (y + 1) * rowBytes);
  }

  const idat = zlib.deflateSync(raw, { level: 9 });
  const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    PNG_SIG,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─── Pixel helpers ────────────────────────────────────────────────────────────
function setPixel(p, W, x, y, a = 255) {
  if (x < 0 || y < 0 || x >= W) return;
  const i = (y * W + x) * 4;
  p[i] = 255; p[i + 1] = 255; p[i + 2] = 255; p[i + 3] = a;
}

function fillRect(p, W, x0, y0, x1, y1) {
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) setPixel(p, W, x, y);
}

// Triangle width at each row for a height-20 triangle of max-width `maxW`
// centred vertically; returns how many pixels wide that row's slice is.
function triWidth(y, H, maxW) {
  return Math.round((1 - Math.abs((2 * y - (H - 1)) / (H - 1))) * maxW);
}

// --- Icon draw functions (20x20, white on transparent) ---
const W = 20, H = 20;

function makeIcon(drawFn) {
  const pixels = Buffer.alloc(W * H * 4, 0); // all transparent
  drawFn(pixels);
  return nativeImage.createFromBuffer(buildPNG(W, H, pixels));
}

// ▶ Play  — right-pointing solid triangle
const playIcon = makeIcon(p => {
  for (let y = 0; y < H; y++) {
    // width at this row: max at centre, 1 at edges
    const half = (H - 1) / 2;
    const w = Math.max(1, Math.round((1 - Math.abs(y - half) / half) * 13));
    for (let x = 3; x < 3 + w; x++) setPixel(p, W, x, y);
  }
});

// ⏸ Pause — two vertical bars
const pauseIcon = makeIcon(p => {
  fillRect(p, W, 3, 2, 7, H - 3);
  fillRect(p, W, 11, 2, 15, H - 3);
});

// ⏮ Previous — small left triangle + left bar
const prevIcon = makeIcon(p => {
  fillRect(p, W, 2, 2, 4, H - 3); // bar
  // left-pointing triangle
  const tip = 16;
  const half = (H - 1) / 2;
  for (let y = 0; y < H; y++) {
    const w = Math.max(1, Math.round((1 - Math.abs(y - half) / half) * 9));
    for (let x = tip - w; x <= tip; x++) setPixel(p, W, x, y);
  }
});

// ⏭ Next — small right triangle + right bar
const nextIcon = makeIcon(p => {
  fillRect(p, W, W - 5, 2, W - 3, H - 3); // bar
  const half = (H - 1) / 2;
  for (let y = 0; y < H; y++) {
    const w = Math.max(1, Math.round((1 - Math.abs(y - half) / half) * 9));
    for (let x = 3; x < 3 + w; x++) setPixel(p, W, x, y);
  }
});

module.exports = { playIcon, pauseIcon, prevIcon, nextIcon };
