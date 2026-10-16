import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function createPNG(w, h, getPixel) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rawRows = [];
  for (let y = 0; y < h; y++) {
    const row = Buffer.alloc(1 + w * 4);
    row[0] = 0; // Filter type None
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = getPixel(x, y, w, h);
      const idx = 1 + x * 4;
      row[idx] = Math.max(0, Math.min(255, Math.round(r)));
      row[idx + 1] = Math.max(0, Math.min(255, Math.round(g)));
      row[idx + 2] = Math.max(0, Math.min(255, Math.round(b)));
      row[idx + 3] = Math.max(0, Math.min(255, Math.round(a)));
    }
    rawRows.push(row);
  }
  const rawData = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, makeChunk('IHDR', ihdr), idat, iend]);
}

// -----------------------------------------------------------------------------
// 1. App Icon Generator (Universal 1024x1024, 512, 192, 180, 64, 32)
// Design: Elegant Japanese Sun, Mountain Fuji silhouette & Kanji "日"
// -----------------------------------------------------------------------------
function generateAppIconPixel(x, y, w, h) {
  const nx = (x / w) * 2 - 1; // -1 to 1
  const ny = (y / h) * 2 - 1; // -1 to 1
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Background deep gradient: Crimson Red (#B91C1C) to Midnight Velvet (#18181B)
  const bgGrad = (ny + 1) / 2; // 0 (top) to 1 (bottom)
  let r = 220 - bgGrad * 140; // 220 -> 80
  let g = 38 - bgGrad * 24;   // 38 -> 14
  let b = 38 - bgGrad * 10;   // 38 -> 28
  let a = 255;

  // Golden halo circle (radius 0.75, width 0.04)
  if (dist > 0.71 && dist < 0.77) {
    const haloIntensity = 1 - Math.abs(dist - 0.74) / 0.03;
    r = r * (1 - haloIntensity) + 245 * haloIntensity;
    g = g * (1 - haloIntensity) + 180 * haloIntensity;
    b = b * (1 - haloIntensity) + 50 * haloIntensity;
  }

  // Central Sun disk (radius 0.6)
  if (dist <= 0.6) {
    const sunGrad = 1 - dist / 0.6;
    r = 239 + sunGrad * 16; // 239 -> 255
    g = 68 - sunGrad * 30;  // 68 -> 38
    b = 68 - sunGrad * 30;
  }

  // Mountain Fuji snow cap silhouette at the bottom (ny > 0.1)
  const fujiSlope = Math.abs(nx) * 1.5 - 0.2;
  if (ny > fujiSlope && ny > 0.15) {
    if (ny < fujiSlope + 0.25) {
      // Snow cap
      r = 255;
      g = 255;
      b = 255;
    } else {
      // Dark mountain base
      r = 30;
      g = 41;
      b = 59;
    }
  }

  // Kanji "日" (strokes in central region)
  // Box bounds: nx in [-0.28, 0.28], ny in [-0.45, 0.15]
  const inBoxX = nx >= -0.28 && nx <= 0.28;
  const inBoxY = ny >= -0.45 && ny <= 0.15;
  const strokeW = 0.065;

  if (inBoxX && inBoxY) {
    // Left vertical stroke
    const leftStroke = nx >= -0.28 && nx <= -0.28 + strokeW;
    // Right vertical stroke
    const rightStroke = nx <= 0.28 && nx >= 0.28 - strokeW;
    // Top horizontal stroke
    const topStroke = ny >= -0.45 && ny <= -0.45 + strokeW;
    // Bottom horizontal stroke
    const bottomStroke = ny <= 0.15 && ny >= 0.15 - strokeW;
    // Middle horizontal stroke
    const midStroke = ny >= -0.15 - strokeW / 2 && ny <= -0.15 + strokeW / 2;

    if (leftStroke || rightStroke || topStroke || bottomStroke || midStroke) {
      r = 255;
      g = 255;
      b = 255;
      a = 255;
    }
  }

  return [r, g, b, a];
}

// -----------------------------------------------------------------------------
// 2. Avatar Presets Generator (12 unique Japanese cultural avatars)
// -----------------------------------------------------------------------------
const AVATAR_DEFINITIONS = [
  {
    id: 'sakura',
    name: 'Hoa Anh Đào (Sakura)',
    color1: [251, 113, 133], // Rose
    color2: [244, 63, 94],
    shape: 'flower',
  },
  {
    id: 'fuji',
    name: 'Núi Phú Sĩ (Fuji)',
    color1: [56, 189, 248], // Sky Blue
    color2: [14, 116, 144],
    shape: 'mountain',
  },
  {
    id: 'torii',
    name: 'Cổng Thần Đạo (Torii)',
    color1: [239, 68, 68], // Red
    color2: [153, 27, 27],
    shape: 'gate',
  },
  {
    id: 'maneki-neko',
    name: 'Mèo May Mắn (Maneki Neko)',
    color1: [254, 240, 138], // Gold
    color2: [234, 179, 8],
    shape: 'cat',
  },
  {
    id: 'samurai',
    name: 'Kiếm Sĩ (Samurai)',
    color1: [71, 85, 105], // Slate
    color2: [15, 23, 42],
    shape: 'helmet',
  },
  {
    id: 'ninja',
    name: 'Nhẫn Giả (Ninja)',
    color1: [147, 51, 234], // Purple
    color2: [59, 7, 100],
    shape: 'mask',
  },
  {
    id: 'daruma',
    name: 'Búp Bê Cầu May (Daruma)',
    color1: [220, 38, 38], // Dark Red
    color2: [127, 29, 29],
    shape: 'circle',
  },
  {
    id: 'shiba',
    name: 'Chó Shiba Inu (Shiba)',
    color1: [251, 146, 60], // Orange
    color2: [194, 65, 12],
    shape: 'shiba',
  },
  {
    id: 'matcha',
    name: 'Trà Đạo (Matcha)',
    color1: [74, 222, 128], // Green
    color2: [22, 101, 52],
    shape: 'tea',
  },
  {
    id: 'ramen',
    name: 'Mì Ramen (Ramen)',
    color1: [251, 191, 36], // Amber
    color2: [180, 83, 9],
    shape: 'bowl',
  },
  {
    id: 'origami',
    name: 'Hạc Giấy (Origami)',
    color1: [45, 212, 191], // Teal
    color2: [13, 148, 136],
    shape: 'crane',
  },
  {
    id: 'kimono',
    name: 'Kimono Truyền Thống',
    color1: [244, 114, 182], // Pink
    color2: [157, 23, 77],
    shape: 'fan',
  },
];

function generateAvatarPixel(x, y, w, h, def) {
  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Circular avatar badge
  if (dist > 0.96) {
    return [0, 0, 0, 0]; // Transparent outer
  }

  // Border ring
  if (dist > 0.90) {
    return [255, 255, 255, 220];
  }

  // Background radial gradient
  const grad = dist / 0.9;
  const bgR = def.color1[0] * (1 - grad) + def.color2[0] * grad;
  const bgG = def.color1[1] * (1 - grad) + def.color2[1] * grad;
  const bgB = def.color1[2] * (1 - grad) + def.color2[2] * grad;

  // Center emblem shapes
  let isEmblem = false;
  let emblemColor = [255, 255, 255, 255];

  if (def.shape === 'flower') {
    // 5-petal sakura flower
    const angle = Math.atan2(ny, nx);
    const petalDist = 0.38 + 0.15 * Math.cos(5 * angle);
    if (dist <= petalDist) {
      isEmblem = true;
      emblemColor = [255, 240, 245, 255];
    }
    // Flower center
    if (dist <= 0.12) {
      isEmblem = true;
      emblemColor = [251, 191, 36, 255];
    }
  } else if (def.shape === 'mountain') {
    // Fuji silhouette
    const slope = Math.abs(nx) * 1.6 - 0.4;
    if (ny >= slope && ny <= 0.6) {
      isEmblem = true;
      emblemColor = ny < slope + 0.35 ? [255, 255, 255, 255] : [30, 58, 138, 255];
    }
  } else if (def.shape === 'gate') {
    // Torii gate
    const topBar = ny >= -0.42 && ny <= -0.32 && Math.abs(nx) <= 0.62;
    const midBar = ny >= -0.22 && ny <= -0.15 && Math.abs(nx) <= 0.48;
    const postLeft = Math.abs(nx + 0.35) <= 0.08 && ny >= -0.42 && ny <= 0.55;
    const postRight = Math.abs(nx - 0.35) <= 0.08 && ny >= -0.42 && ny <= 0.55;
    if (topBar || midBar || postLeft || postRight) {
      isEmblem = true;
      emblemColor = [255, 255, 255, 255];
    }
  } else if (def.shape === 'cat' || def.shape === 'shiba') {
    // Head circle + ears
    const head = dist <= 0.45;
    const earL = Math.hypot(nx + 0.3, ny + 0.4) <= 0.18;
    const earR = Math.hypot(nx - 0.3, ny + 0.4) <= 0.18;
    if (head || earL || earR) {
      isEmblem = true;
      emblemColor = [255, 255, 255, 255];
    }
    // Eyes & nose
    if (
      (Math.hypot(nx + 0.16, ny + 0.05) <= 0.05) ||
      (Math.hypot(nx - 0.16, ny + 0.05) <= 0.05) ||
      (Math.hypot(nx, ny - 0.12) <= 0.04)
    ) {
      isEmblem = true;
      emblemColor = [30, 41, 59, 255];
    }
  } else {
    // Generic elegant emblem: Zen enso circle & diamond
    if (dist >= 0.32 && dist <= 0.48) {
      isEmblem = true;
      emblemColor = [255, 255, 255, 250];
    }
    if (dist <= 0.14) {
      isEmblem = true;
      emblemColor = [255, 255, 255, 255];
    }
  }

  if (isEmblem) {
    return emblemColor;
  }

  return [bgR, bgG, bgB, 255];
}

// -----------------------------------------------------------------------------
// Main execution
// -----------------------------------------------------------------------------
console.log('🎨 Đang tạo bộ App Icon & Web Avatars độ phân giải cao...');

// 1. Ensure target directories
const publicDir = path.join(process.cwd(), 'public');
const avatarsDir = path.join(publicDir, 'images', 'avatars');
const iosAppIconDir = path.join(process.cwd(), 'ios', 'Assets.xcassets', 'AppIcon.appiconset');

fs.mkdirSync(avatarsDir, { recursive: true });
fs.mkdirSync(iosAppIconDir, { recursive: true });

// 2. Generate iOS 1024x1024 App Icon
console.log('-> Tạo iOS AppIcon 1024x1024...');
const icon1024 = createPNG(1024, 1024, generateAppIconPixel);
fs.writeFileSync(path.join(iosAppIconDir, 'app-icon-1024.png'), icon1024);

// Write iOS AppIcon Contents.json
const contentsJson = {
  images: [
    {
      filename: 'app-icon-1024.png',
      idiom: 'universal',
      platform: 'ios',
      size: '1024x1024',
    },
  ],
  info: {
    author: 'xcode',
    version: 1,
  },
};
fs.writeFileSync(
  path.join(iosAppIconDir, 'Contents.json'),
  JSON.stringify(contentsJson, null, 2),
  'utf-8'
);

// 3. Generate Web Icons (512, 192, 180, 64, 32)
console.log('-> Tạo Web icons (512x512, 192x192, 180x180, favicon)...');
const icon512 = createPNG(512, 512, generateAppIconPixel);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);

const icon192 = createPNG(192, 192, generateAppIconPixel);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);

const icon180 = createPNG(180, 180, generateAppIconPixel);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), icon180);

const icon64 = createPNG(64, 64, generateAppIconPixel);
fs.writeFileSync(path.join(publicDir, 'favicon.png'), icon64);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icon64); // ICO wrapper fallback

// 4. Generate 12 Avatars
console.log('-> Tạo 12 Avatars phong cách Nhật Bản...');
for (const avatar of AVATAR_DEFINITIONS) {
  const avatarPng = createPNG(256, 256, (x, y, w, h) =>
    generateAvatarPixel(x, y, w, h, avatar)
  );
  const targetPath = path.join(avatarsDir, `${avatar.id}.png`);
  fs.writeFileSync(targetPath, avatarPng);
  console.log(`   ✓ Avatar: ${avatar.name} (${avatar.id}.png)`);
}

// 5. Generate PWA Web App Manifest
console.log('-> Tạo Web App Manifest (PWA)...');
const manifest = {
  name: 'NihongoMaster - Học Tiếng Nhật Toàn Diện',
  short_name: 'NihongoMaster',
  description: 'Nền tảng học tiếng Nhật miễn phí dành cho người Việt',
  start_url: '/',
  display: 'standalone',
  background_color: '#09090b',
  theme_color: '#dc2626',
  orientation: 'portrait',
  icons: [
    {
      src: '/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
    },
  ],
};
fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

console.log('✨ HOÀN TẤT TẠO BỘ AVATAR & ICON TOÀN DIỆN CHO WEB & APP!');
