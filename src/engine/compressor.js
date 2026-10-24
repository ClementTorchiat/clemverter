/**
 * clemverter - Smart In-Browser Image Compressor Engine
 * Maximizes space savings while preserving visual fidelity.
 */
import { convertImage } from './converter.js';

export const COMPRESSION_PRESETS = {
  gentle: {
    id: 'gentle',
    label: 'Doux (Fidélité max)',
    badge: 'Qualité 85%',
    quality: 0.85,
    description: 'Préservation maximale des détails les plus fins. Recommandé pour la photo d\'art et les portfolios.'
  },
  balanced: {
    id: 'balanced',
    label: 'Équilibré (Recommandé)',
    badge: 'Qualité 75%',
    quality: 0.75,
    description: 'Le parfait compromis : perte visuelle quasi imperceptible et gain de poids de 60 à 80%.'
  },
  eco: {
    id: 'eco',
    label: 'Ultra Éco (Poids plume)',
    badge: 'Qualité 52%',
    quality: 0.52,
    description: 'Compression agressive pour un chargement instantané sur mobile et réseaux lents.'
  },
  custom: {
    id: 'custom',
    label: 'Personnalisé',
    badge: 'Sur-mesure',
    quality: 0.75,
    description: 'Réglez précisément le curseur de qualité de 1% à 100% selon vos exigences.'
  }
};

/**
 * Compresses an image using target quality and smart WebP transcoding
 * @param {File|Blob} file 
 * @param {Object} options 
 */
export async function compressImage(file, options = {}) {
  const presetKey = options.preset || 'balanced';
  const preset = COMPRESSION_PRESETS[presetKey] || COMPRESSION_PRESETS.balanced;
  
  const quality = options.customQuality !== undefined ? options.customQuality : preset.quality;
  const convertToWebp = options.convertToWebp !== undefined ? options.convertToWebp : true;
  const maxDimension = options.maxDimension ? parseInt(options.maxDimension, 10) : 0;

  // Determine output MIME
  let targetMime = file.type || 'image/jpeg';
  if (convertToWebp) {
    targetMime = 'image/webp';
  } else if (targetMime === 'image/png' && quality < 0.95) {
    // If user wants to compress a PNG without converting to WebP, standard canvas PNG is lossless,
    // so to compress we can convert to WebP or JPEG if no transparency, or WebP is the ideal choice.
    targetMime = 'image/webp';
  }

  const convOptions = {
    targetMime,
    quality,
    resizeMode: maxDimension > 0 ? 'maxWidth' : 'original',
    maxWidth: maxDimension > 0 ? maxDimension : undefined
  };

  const startTime = performance.now();
  const result = await convertImage(file, convOptions);
  const duration = Math.round(performance.now() - startTime);

  const originalSize = file.size;
  const compressedSize = result.size;
  const savedBytes = originalSize - compressedSize;
  const savedPercent = originalSize > 0 
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
    : 0;

  return {
    ...result,
    preset: presetKey,
    qualityUsed: quality,
    originalSize,
    compressedSize,
    savedBytes,
    savedPercent,
    durationMs: duration
  };
}
