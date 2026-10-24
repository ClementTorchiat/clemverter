/**
 * clemverter - Format support and capability detection
 * Supports reading: WebP, PNG, JPEG, AVIF, GIF, SVG, BMP, ICO, HEIC, TIFF
 * Supports writing: WebP (Priority), PNG, JPEG, AVIF, BMP, ICO
 */

// Supported target output formats
export const OUTPUT_FORMATS = [
  {
    id: 'image/webp',
    ext: 'webp',
    name: 'WebP',
    badge: 'Recommandé',
    badgeClass: 'badge-recommended',
    description: 'Format moderne idéal pour le web, compression ultra-efficace avec ou sans perte.',
    supportsQuality: true,
    supportsLossless: true,
    defaultQuality: 0.82
  },
  {
    id: 'image/jpeg',
    ext: 'jpg',
    name: 'JPEG / JPG',
    badge: 'Universel',
    badgeClass: 'badge-neutral',
    description: 'Compatibilité universelle avec toutes les plateformes et appareils.',
    supportsQuality: true,
    supportsLossless: false,
    defaultQuality: 0.85
  },
  {
    id: 'image/png',
    ext: 'png',
    name: 'PNG',
    badge: 'Sans perte',
    badgeClass: 'badge-neutral',
    description: 'Qualité parfaite avec transparence alpha, idéal pour logos et graphiques.',
    supportsQuality: false,
    supportsLossless: true,
    defaultQuality: 1.0
  },
  {
    id: 'image/avif',
    ext: 'avif',
    name: 'AVIF',
    badge: 'Next-Gen',
    badgeClass: 'badge-info',
    description: 'Compression de nouvelle génération dérivée du codec AV1.',
    supportsQuality: true,
    supportsLossless: false,
    defaultQuality: 0.80
  },
  {
    id: 'image/bmp',
    ext: 'bmp',
    name: 'BMP',
    badge: 'Bitmap',
    badgeClass: 'badge-neutral',
    description: 'Format bitmap non compressé standard pour Windows.',
    supportsQuality: false,
    supportsLossless: true,
    defaultQuality: 1.0
  },
  {
    id: 'image/x-icon',
    ext: 'ico',
    name: 'ICO (Favicon)',
    badge: 'Icône',
    badgeClass: 'badge-neutral',
    description: 'Icône de site web / application (16x16, 32x32, 48x48, 64x64 ou original).',
    supportsQuality: false,
    supportsLossless: true,
    defaultQuality: 1.0
  }
];

// Accepted input formats string for <input type="file" accept="...">
export const ACCEPTED_INPUT_MIME = [
  'image/webp',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/avif',
  'image/svg+xml',
  'image/bmp',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/heic',
  'image/heif',
  'image/tiff',
  '.webp',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.avif',
  '.svg',
  '.bmp',
  '.ico',
  '.heic',
  '.heif',
  '.tif',
  '.tiff'
].join(',');

// Detect browser encoding support for given MIME type
const canvasCapabilityCache = {};

export function checkFormatSupport(mimeType) {
  if (canvasCapabilityCache[mimeType] !== undefined) {
    return canvasCapabilityCache[mimeType];
  }
  if (mimeType === 'image/bmp' || mimeType === 'image/x-icon') {
    // Custom JS encoders are always supported
    canvasCapabilityCache[mimeType] = true;
    return true;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const dataUrl = canvas.toDataURL(mimeType);
    const supported = dataUrl.startsWith(`data:${mimeType}`);
    canvasCapabilityCache[mimeType] = supported;
    return supported;
  } catch {
    canvasCapabilityCache[mimeType] = false;
    return false;
  }
}

// Detect format from file or file name
export function detectFormat(file) {
  if (file.type) {
    return file.type;
  }
  const ext = file.name.split('.').pop().toLowerCase();
  switch (ext) {
    case 'webp': return 'image/webp';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'avif': return 'image/avif';
    case 'svg': return 'image/svg+xml';
    case 'bmp': return 'image/bmp';
    case 'ico': return 'image/x-icon';
    case 'heic': return 'image/heic';
    case 'heif': return 'image/heif';
    case 'tif':
    case 'tiff': return 'image/tiff';
    default: return 'application/octet-stream';
  }
}

// Human readable file size
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes <= 0) return '0 o';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['o', 'Ko', 'Mo', 'Go'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  return `${val} ${sizes[i]}`;
}
