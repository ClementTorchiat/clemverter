/**
 * clemverter - High-Performance In-Browser Image Converter Engine
 * 100% Client-Side. No limits on file size or batch quantity.
 */
import { canvasToBmpBlob, canvasToIcoBlob } from './bmpIcoEncoders.js';
import { checkFormatSupport } from './formatSupport.js';

// Lazy loader for heic2any so it only loads if the user actually uploads an Apple HEIC/HEIF file
let heic2anyModule = null;
async function getHeic2Any() {
  if (!heic2anyModule) {
    try {
      const mod = await import('heic2any');
      heic2anyModule = mod.default || mod;
    } catch (err) {
      console.warn('Failed to load heic2any:', err);
      throw new Error('Le convertisseur HEIC n\'a pas pu être chargé.');
    }
  }
  return heic2anyModule;
}

/**
 * Loads a File / Blob into an HTMLImageElement or ImageBitmap
 */
export async function loadImageElement(file) {
  let blob = file;
  const fileName = file.name ? file.name.toLowerCase() : '';
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || fileName.endsWith('.heic') || fileName.endsWith('.heif');

  if (isHeic) {
    const heic2any = await getHeic2Any();
    const converted = await heic2any({
      blob: file,
      toType: 'image/png'
    });
    blob = Array.isArray(converted) ? converted[0] : converted;
  }

  const objectUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Keep objectUrl on image for later cleanup
      img._objectUrl = objectUrl;
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Impossible de charger l'image ${file.name || ''}: format corrompu ou non supporté.`));
    };
    img.src = objectUrl;
  });
}

/**
 * Calculates target dimensions based on options
 */
export function calculateTargetDimensions(srcWidth, srcHeight, options = {}) {
  const mode = options.resizeMode || 'original'; // 'original', 'scale', 'maxWidth', 'custom'

  if (mode === 'scale' && options.scalePercent) {
    const factor = Math.max(0.01, Math.min(2.0, options.scalePercent / 100));
    return {
      width: Math.max(1, Math.round(srcWidth * factor)),
      height: Math.max(1, Math.round(srcHeight * factor))
    };
  }

  if (mode === 'maxWidth' && options.maxWidth) {
    const maxW = parseInt(options.maxWidth, 10);
    if (srcWidth > maxW) {
      const ratio = maxW / srcWidth;
      return {
        width: maxW,
        height: Math.max(1, Math.round(srcHeight * ratio))
      };
    }
  }

  if (mode === 'custom') {
    const customW = parseInt(options.customWidth, 10);
    const customH = parseInt(options.customHeight, 10);

    if (options.keepAspectRatio) {
      if (customW && !customH) {
        return {
          width: customW,
          height: Math.max(1, Math.round(srcHeight * (customW / srcWidth)))
        };
      }
      if (customH && !customW) {
        return {
          width: Math.max(1, Math.round(srcWidth * (customH / srcHeight))),
          height: customH
        };
      }
      if (customW && customH) {
        // Fit within custom box
        const ratio = Math.min(customW / srcWidth, customH / srcHeight);
        return {
          width: Math.max(1, Math.round(srcWidth * ratio)),
          height: Math.max(1, Math.round(srcHeight * ratio))
        };
      }
    } else if (customW && customH) {
      return { width: customW, height: customH };
    }
  }

  return { width: srcWidth, height: srcHeight };
}

/**
 * Converts an image file to target format and settings
 * @param {File|Blob} file - Source file
 * @param {Object} options - Conversion options
 * @returns {Promise<{ blob: Blob, width: number, height: number, size: number, name: string, url: string }>}
 */
export async function convertImage(file, options = {}) {
  const targetMime = options.targetMime || 'image/webp';
  const quality = options.quality !== undefined ? options.quality : 0.82;
  const isLossless = !!options.lossless;
  const icoSize = options.icoSize || 32;

  // 1. Load the image
  const img = await loadImageElement(file);
  const srcWidth = img.naturalWidth || img.width;
  const srcHeight = img.naturalHeight || img.height;

  // 2. Compute target dimensions
  const { width: targetWidth, height: targetHeight } = calculateTargetDimensions(srcWidth, srcHeight, options);

  // 3. Render onto canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { alpha: true });

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // If converting to JPEG or BMP which don't support alpha, fill transparent areas with white background
  if (targetMime === 'image/jpeg' || (targetMime === 'image/bmp' && !options.preserveBmpAlpha)) {
    ctx.fillStyle = options.backgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Clean up source image object URL
  if (img._objectUrl) {
    URL.revokeObjectURL(img._objectUrl);
  }

  // 4. Encode to target format
  let outputBlob;

  if (targetMime === 'image/bmp') {
    outputBlob = canvasToBmpBlob(canvas);
  } else if (targetMime === 'image/x-icon') {
    outputBlob = await canvasToIcoBlob(canvas, icoSize);
  } else if (targetMime === 'image/avif') {
    if (checkFormatSupport('image/avif')) {
      outputBlob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/avif', quality);
      });
    } else {
      // Graceful fallback to WebP if AVIF is not supported by current browser
      console.warn('AVIF encoding not supported natively in this browser, falling back to WebP');
      outputBlob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/webp', quality);
      });
    }
  } else if (targetMime === 'image/webp') {
    const q = isLossless ? 1.0 : quality;
    outputBlob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/webp', q);
    });
  } else if (targetMime === 'image/jpeg') {
    outputBlob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', quality);
    });
  } else if (targetMime === 'image/png') {
    outputBlob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
  } else {
    // Default fallback
    outputBlob = await new Promise((resolve) => {
      canvas.toBlob(resolve, targetMime, quality);
    });
  }

  // Generate target filename
  const baseName = (file.name || 'image').replace(/\.[^/.]+$/, '');
  const extensionMap = {
    'image/webp': 'webp',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/avif': 'avif',
    'image/bmp': 'bmp',
    'image/x-icon': 'ico'
  };
  const ext = extensionMap[targetMime] || 'webp';
  const outputFileName = `${baseName}.${ext}`;
  const outputUrl = URL.createObjectURL(outputBlob);

  return {
    blob: outputBlob,
    width: targetWidth,
    height: targetHeight,
    size: outputBlob.size,
    name: outputFileName,
    url: outputUrl,
    srcWidth,
    srcHeight,
    originalSize: file.size
  };
}

/**
 * Process a batch queue with bounded concurrency so memory stays low even for hundreds of photos
 * @param {Array<Object>} items - Array of { file, options, id }
 * @param {Function} onItemStart - Callback when item starts processing
 * @param {Function} onItemProgress - Callback with item result or error
 * @param {Function} onBatchProgress - Callback with overall { completed, total, percent }
 * @param {number} concurrency - Concurrent workers (default 4)
 */
export async function processBatchQueue({
  items,
  concurrency = 4,
  onItemStart = () => {},
  onItemProgress = () => {},
  onBatchProgress = () => {}
}) {
  const total = items.length;
  let completed = 0;
  let index = 0;
  const results = new Array(total);

  async function worker() {
    while (index < total) {
      const currentIndex = index++;
      const item = items[currentIndex];

      onItemStart(item, currentIndex);

      try {
        const result = await convertImage(item.file, item.options);
        results[currentIndex] = { status: 'success', item, result };
        onItemProgress({ status: 'success', item, result, index: currentIndex });
      } catch (error) {
        console.error('Conversion failed for item:', item, error);
        results[currentIndex] = { status: 'error', item, error: error.message || 'Erreur de traitement' };
        onItemProgress({ status: 'error', item, error: error.message || 'Erreur de traitement', index: currentIndex });
      }

      completed++;
      onBatchProgress({
        completed,
        total,
        percent: Math.round((completed / total) * 100)
      });
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, total) }, () => worker());
  await Promise.all(workers);

  return results;
}
