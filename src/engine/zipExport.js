/**
 * clemverter - Batch ZIP exporter
 * Packages all processed images into a clean .zip archive in-browser
 */
import JSZip from 'jszip';

export async function exportBatchAsZip(items, zipName = 'clemverter_export.zip', onProgress = () => {}) {
  const zip = new JSZip();
  const usedNames = new Set();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.result || !item.result.blob) continue;

    let fileName = item.result.name || `image_${i + 1}.webp`;
    
    // Avoid duplicate names inside zip
    if (usedNames.has(fileName)) {
      const parts = fileName.split('.');
      const ext = parts.pop();
      const base = parts.join('.');
      let counter = 1;
      while (usedNames.has(`${base}_${counter}.${ext}`)) {
        counter++;
      }
      fileName = `${base}_${counter}.${ext}`;
    }
    usedNames.add(fileName);

    zip.file(fileName, item.result.blob);
  }

  // Generate zip archive
  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    },
    (metadata) => {
      onProgress(Math.round(metadata.percent));
    }
  );

  // Trigger download
  const downloadUrl = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 10000);

  return zipBlob;
}

export function downloadSingleFile(blob, fileName) {
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 5000);
}
