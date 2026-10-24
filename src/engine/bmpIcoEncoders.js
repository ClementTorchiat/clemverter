/**
 * In-browser BMP and ICO encoders.
 * Allows client-side export to .bmp and .ico files with 0 external dependencies.
 */

/**
 * Encodes an HTMLCanvasElement into a BMP Blob (24-bit uncompressed)
 */
export function canvasToBmpBlob(canvas) {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 24-bit RGB (3 bytes per pixel). Each row must be padded to a multiple of 4 bytes.
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileHeaderSize = 14;
  const dibHeaderSize = 40;
  const offset = fileHeaderSize + dibHeaderSize;
  const fileSize = offset + pixelArraySize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // BITMAPFILEHEADER (14 bytes)
  view.setUint16(0, 0x4d42, true); // 'BM'
  view.setUint32(2, fileSize, true); // File size
  view.setUint16(6, 0, true); // Reserved
  view.setUint16(8, 0, true); // Reserved
  view.setUint32(10, offset, true); // Offset to pixel data

  // BITMAPINFOHEADER (40 bytes)
  view.setUint32(14, dibHeaderSize, true); // DIB header size
  view.setInt32(18, width, true); // Width
  view.setInt32(22, height, true); // Height (positive = bottom-up)
  view.setUint16(26, 1, true); // Color planes = 1
  view.setUint16(28, 24, true); // Bits per pixel = 24
  view.setUint32(30, 0, true); // BI_RGB (no compression)
  view.setUint32(34, pixelArraySize, true); // Image data size
  view.setInt32(38, 2835, true); // Horizontal resolution (72 DPI)
  view.setInt32(42, 2835, true); // Vertical resolution (72 DPI)
  view.setUint32(46, 0, true); // Palette colors
  view.setUint32(50, 0, true); // Important colors

  // Pixel array (bottom-to-top, BGR format)
  const uint8 = new Uint8Array(buffer);
  let pos = offset;

  for (let y = height - 1; y >= 0; y--) {
    const rowOffset = y * width * 4;
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + x * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      // BGR order
      uint8[pos++] = b;
      uint8[pos++] = g;
      uint8[pos++] = r;
    }
    // Padding to 4-byte boundary
    for (let p = 0; p < rowSize - width * 3; p++) {
      uint8[pos++] = 0;
    }
  }

  return new Blob([buffer], { type: 'image/bmp' });
}

/**
 * Encodes an HTMLCanvasElement into an ICO Blob (PNG-in-ICO standard).
 * Generates an ICO file embedding the image at target dimensions (default: 32x32 or custom).
 */
export async function canvasToIcoBlob(canvas, targetSize = 32) {
  // If targetSize is provided and differs, scale into an offscreen canvas
  let exportCanvas = canvas;
  if (targetSize && (canvas.width !== targetSize || canvas.height !== targetSize)) {
    exportCanvas = document.createElement('canvas');
    exportCanvas.width = targetSize;
    exportCanvas.height = targetSize;
    const ctx = exportCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, targetSize, targetSize);
  }

  // Get PNG blob
  const pngBlob = await new Promise((resolve) => {
    exportCanvas.toBlob(resolve, 'image/png');
  });

  const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
  const width = Math.min(exportCanvas.width, 256);
  const height = Math.min(exportCanvas.height, 256);

  // ICO header: 6 bytes + 1 directory entry (16 bytes) + PNG data
  const headerSize = 6;
  const dirEntrySize = 16;
  const dataOffset = headerSize + dirEntrySize;
  const totalSize = dataOffset + pngBytes.length;

  const icoBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(icoBuffer);

  // ICONDIR Header
  view.setUint16(0, 0, true); // Reserved (must be 0)
  view.setUint16(2, 1, true); // Resource type: 1 for icon (.ico)
  view.setUint16(4, 1, true); // Number of images: 1

  // ICONDIRENTRY (16 bytes)
  view.setUint8(6, width >= 256 ? 0 : width); // Width (0 means 256)
  view.setUint8(7, height >= 256 ? 0 : height); // Height (0 means 256)
  view.setUint8(8, 0); // Color count (0 for >= 8bpp)
  view.setUint8(9, 0); // Reserved
  view.setUint16(10, 1, true); // Color planes
  view.setUint16(12, 32, true); // Bits per pixel
  view.setUint32(14, pngBytes.length, true); // Size of image data in bytes
  view.setUint32(18, dataOffset, true); // Offset of image data

  // Copy PNG data
  const uint8 = new Uint8Array(icoBuffer);
  uint8.set(pngBytes, dataOffset);

  return new Blob([icoBuffer], { type: 'image/x-icon' });
}
