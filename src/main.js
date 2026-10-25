/**
 * clemverter - Main Application Entrypoint
 * Minimalist, Cozy & Lo-Fi Image Converter and Compressor
 * 100% Client-Side • Infinite Batch & No Daily Quota
 */

import './style.css';
import { icons } from './components/icons.js';
import { OUTPUT_FORMATS, ACCEPTED_INPUT_MIME, detectFormat, formatBytes } from './engine/formatSupport.js';
import { convertImage, processBatchQueue } from './engine/converter.js';
import { COMPRESSION_PRESETS, compressImage } from './engine/compressor.js';
import { exportBatchAsZip, downloadSingleFile } from './engine/zipExport.js';
import { lofiAudio } from './engine/lofiAudio.js';
import { renderCustomSelect, initCustomSelects } from './components/customSelect.js';

// Application State
const state = {
  activeTab: 'convert', // 'convert' | 'compress'
  theme: localStorage.getItem('clemverter_theme') || 'light',
  items: [], // Array of image items
  isProcessing: false,
  batchProgress: { completed: 0, total: 0, percent: 0 },
  zipProgress: 0,
  isZipping: false,
  modalItem: null,
  showBanner: localStorage.getItem('clemverter_banner_dismissed') !== 'true',

  // Converter Settings
  converter: {
    targetMime: 'image/webp',
    quality: 0.82,
    lossless: false,
    resizeMode: 'original', // 'original' | 'scale' | 'maxWidth' | 'custom'
    scalePercent: 75,
    maxWidth: 1920,
    customWidth: '',
    customHeight: '',
    keepAspectRatio: true,
    icoSize: 32
  },

  // Compressor Settings
  compressor: {
    preset: 'balanced', // 'gentle' | 'balanced' | 'eco' | 'custom'
    customQuality: 0.75,
    convertToWebp: true,
    maxDimension: 0 // 0 = no clamp, or 1920 / 2560
  }
};

/**
 * Update favicon dynamically to match the current theme
 */
function updateFavicon(theme) {
  const isDark = theme === 'dark';
  const href = isDark ? '/favicon-dark.svg' : '/favicon-light.svg';
  
  const existingLink = document.querySelector("link[rel~='icon']");
  const newLink = document.createElement('link');
  newLink.rel = 'icon';
  newLink.type = 'image/svg+xml';
  newLink.href = href;
  
  if (existingLink) {
    document.head.removeChild(existingLink);
  }
  document.head.appendChild(newLink);
}

// Apply initial theme & favicon
document.documentElement.setAttribute('data-theme', state.theme);
updateFavicon(state.theme);

const app = document.querySelector('#app');

/**
 * Render complete application UI
 */
function renderApp() {
  app.innerHTML = `
    <!-- Header -->
    <header class="header">
      <div class="brand-wrapper">
        <div class="brand-icon">
          ${icons.coffee}
        </div>
        <div class="brand-text">
          <h1>clemverter</h1>
          <p class="brand-tagline">Convertisseur & compresseur d'images local et illimité.</p>
        </div>
      </div>

      <div class="header-actions">
        <!-- Lofi Ambient Audio Player -->
        <div class="lofi-player" title="Ambiance sonore relaxante (Générée localement)">
          <button class="lofi-btn ${lofiAudio.isPlaying() ? 'is-active' : ''}" id="btn-lofi-toggle">
            ${lofiAudio.isPlaying() ? icons.pause : icons.music}
            <span>${lofiAudio.isPlaying() ? 'En pause' : 'Ambiance lofi'}</span>
          </button>
          
          ${renderCustomSelect({
            id: 'lofi-track-select',
            value: lofiAudio.getTrack(),
            options: [
              { value: 'rain', label: 'Pluie douce', icon: icons.rain },
              { value: 'vinyl', label: 'Vinyle chaud', icon: icons.vinyl }
            ],
            ariaLabel: 'Choix du son lofi',
            variant: 'compact'
          })}
        </div>

        <!-- Theme Toggle -->
        <button class="theme-toggle-btn" id="btn-theme-toggle" title="Basculer entre thème Café et Nuit Lofi" aria-label="Thème sombre / clair">
          ${state.theme === 'dark' ? icons.sun : icons.moon}
        </button>
      </div>
    </header>

    <!-- Value Proposition Banner (dismissible) -->
    ${state.showBanner ? `
      <section class="value-banner" id="value-banner" aria-label="Avantages de clemverter">
        <div class="value-items">
          <div class="value-item">
            <span class="icon-wrap">${icons.infinity}</span>
            <span><strong>Zéro limite :</strong> Traitez autant d'images que souhaité en un seul lot.</span>
          </div>
          <div class="value-item">
            <span class="icon-wrap">${icons.shield}</span>
            <span><strong>100% Privé :</strong> Tout est calculé dans votre navigateur, aucun envoi serveur.</span>
          </div>
          <div class="value-item">
            <span class="icon-wrap">${icons.bolt}</span>
            <span><strong>Format WebP :</strong> Réduction de poids record avec ou sans perte.</span>
          </div>
        </div>
        <button class="banner-close-btn" id="btn-close-banner" title="Masquer ce message" aria-label="Fermer la boîte d'information">
          ${icons.close}
        </button>
      </section>
    ` : ''}

    <!-- Main Navigation Tabs -->
    <nav class="tabs-nav-container" aria-label="Navigation des modes">
      <div class="tabs-nav">
        <button class="tab-btn ${state.activeTab === 'convert' ? 'is-active' : ''}" id="tab-convert">
          ${icons.converter}
          <span>Convertisseur</span>
          <span class="tab-badge">WebP / AVIF / JPG...</span>
        </button>
        <button class="tab-btn ${state.activeTab === 'compress' ? 'is-active' : ''}" id="tab-compress">
          ${icons.compressor}
          <span>Compresseur</span>
          <span class="tab-badge">-70% en moyenne</span>
        </button>
      </div>
    </nav>

    <!-- Drop Zone -->
    <section class="dropzone-wrapper">
      <div class="dropzone" id="dropzone" tabindex="0" role="button" aria-label="Zone de dépôt des images">
        <input type="file" id="file-input" multiple accept="${ACCEPTED_INPUT_MIME}" style="display: none;" />
        <div class="dropzone-content">
          <div class="dropzone-icon-circle">
            ${icons.upload}
          </div>
          <h2 class="dropzone-title">Glissez vos images ou dossiers ici</h2>
          <p class="dropzone-desc">Déposez un nombre illimité de fichiers ou collez directement une image depuis votre presse-papiers (<kbd>Ctrl+V</kbd> / <kbd>Cmd+V</kbd>).</p>
          <div class="dropzone-actions">
            <button type="button" class="btn-file-select" id="btn-browse-files">
              Parcourir les fichiers
            </button>
          </div>
          <div class="dropzone-formats">
            <span class="format-pill highlight">★ WEBP</span>
            <span class="format-pill">PNG</span>
            <span class="format-pill">JPEG</span>
            <span class="format-pill">AVIF</span>
            <span class="format-pill">HEIC (iPhone)</span>
            <span class="format-pill">GIF</span>
            <span class="format-pill">SVG</span>
            <span class="format-pill">BMP</span>
            <span class="format-pill">ICO</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Settings Panel (Changes depending on active tab) -->
    ${renderSettingsPanel()}

    <!-- Actions & Stats Dashboard -->
    ${renderStatsAndActions()}

    <!-- Images Queue -->
    <section class="queue-container" id="queue-container" aria-label="Liste des images">
      ${renderQueueList()}
    </section>

    <!-- Comparison Modal Container -->
    <div id="modal-container">
      ${renderModal()}
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div>
        <strong>clemverter</strong> — L'atelier d'images open web.
      </div>
      <div>
        <span>Traitement 100% in-browser • Zéro tracking • Sans publicité</span>
      </div>
    </footer>
  `;

  bindEventListeners();
}

/**
 * Helper to display current resize mode badge
 */
function getResizeBadgeText() {
  switch (state.converter.resizeMode) {
    case 'scale':
      return `${state.converter.scalePercent}%`;
    case 'maxWidth':
      return `Max ${state.converter.maxWidth}px`;
    case 'custom':
      return (state.converter.customWidth || state.converter.customHeight)
        ? `${state.converter.customWidth || '?'}×${state.converter.customHeight || '?'}`
        : 'Sur-mesure';
    default:
      return '100% (Original)';
  }
}

/**
 * Render dynamic sub-controls for resizing inside the card footer
 */
function renderResizeSubControls() {
  switch (state.converter.resizeMode) {
    case 'scale':
      return `
        <div class="sub-control-row">
          <input type="range" class="slider-custom" id="convert-scale-slider" min="10" max="150" step="5" value="${state.converter.scalePercent}" aria-label="Échelle relative" />
          <span class="slider-value-sm" id="scale-val-display">${state.converter.scalePercent}%</span>
        </div>
      `;
    case 'maxWidth':
      return `
        <div class="sub-control-row">
          <input type="number" class="input-custom input-sm" id="convert-max-width" placeholder="Largeur max" value="${state.converter.maxWidth}" aria-label="Largeur maximale" />
          <span class="setting-hint" style="white-space: nowrap;">px max</span>
        </div>
      `;
    case 'custom':
      return `
        <div class="sub-control-row">
          <input type="number" class="input-custom input-sm" id="convert-custom-w" placeholder="Larg." value="${state.converter.customWidth}" aria-label="Largeur" />
          <span>×</span>
          <input type="number" class="input-custom input-sm" id="convert-custom-h" placeholder="Haut." value="${state.converter.customHeight}" aria-label="Hauteur" />
          <label class="checkbox-label" title="Garder le ratio" style="margin-left: 0.25rem;">
            <input type="checkbox" class="checkbox-custom" id="convert-aspect-check" ${state.converter.keepAspectRatio ? 'checked' : ''} />
            <span style="font-size: 0.76rem;">Ratio</span>
          </label>
        </div>
      `;
    default:
      return `<span class="setting-hint">Ratio & dimensions d'origine préservés</span>`;
  }
}

/**
 * Render settings panel according to active tab
 */
function renderSettingsPanel() {
  if (state.activeTab === 'convert') {
    const curFormat = OUTPUT_FORMATS.find(f => f.id === state.converter.targetMime) || OUTPUT_FORMATS[0];

    return `
      <div class="panel-settings">
        <div class="settings-header">
          <div class="settings-title">
            ${icons.converter}
            <span>Paramètres de conversion globale</span>
          </div>
          <span class="brand-badge">${curFormat.name} sélectionné</span>
        </div>

        <div class="settings-cards-grid">
          <!-- 1. Format de sortie -->
          <div class="setting-card">
            <div class="setting-card-header">
              <span class="setting-card-title">
                ${icons.sparkles}
                <span>Format de sortie</span>
              </span>
              <span class="setting-card-badge">${curFormat.name}</span>
            </div>
            <div class="setting-card-body">
              ${renderCustomSelect({
                id: 'convert-format-select',
                value: state.converter.targetMime,
                options: OUTPUT_FORMATS.map(f => ({
                  value: f.id,
                  label: f.name,
                  badge: f.badge,
                  badgeClass: f.badgeClass,
                  description: f.description
                })),
                ariaLabel: 'Format de sortie'
              })}
            </div>
            <div class="setting-card-footer">
              <span class="setting-hint">${curFormat.description}</span>
            </div>
          </div>

          <!-- 2. Qualité de compression -->
          <div class="setting-card">
            <div class="setting-card-header">
              <span class="setting-card-title">
                ${icons.compressor}
                <span>Qualité de compression</span>
              </span>
              <span class="setting-card-badge" id="quality-val-display">${curFormat.supportsQuality ? `${Math.round(state.converter.quality * 100)}%` : 'Sans perte'}</span>
            </div>
            <div class="setting-card-body">
              ${curFormat.supportsQuality ? `
                <div class="slider-control-box">
                  <input type="range" class="slider-custom" id="convert-quality-slider" min="5" max="100" step="1" value="${Math.round(state.converter.quality * 100)}" aria-label="Qualité de compression" />
                </div>
              ` : `
                <div class="setting-card-static">
                  <span>Format sans perte (Lossless) par défaut</span>
                </div>
              `}
            </div>
            <div class="setting-card-footer">
              ${curFormat.supportsQuality && curFormat.supportsLossless ? `
                <label class="checkbox-label">
                  <input type="checkbox" class="checkbox-custom" id="convert-lossless-check" ${state.converter.lossless ? 'checked' : ''} />
                  <span>Mode Sans Perte (Lossless)</span>
                </label>
              ` : `
                <span class="setting-hint">Qualité optimale préservée sans artéfacts</span>
              `}
            </div>
          </div>

          <!-- 3. Redimensionnement -->
          <div class="setting-card">
            <div class="setting-card-header">
              <span class="setting-card-title">
                ${icons.converter}
                <span>Redimensionnement</span>
              </span>
              <span class="setting-card-badge">${getResizeBadgeText()}</span>
            </div>
            <div class="setting-card-body">
              ${renderCustomSelect({
                id: 'convert-resize-select',
                value: state.converter.resizeMode,
                options: [
                  { value: 'original', label: 'Conserver dimensions', badge: '100%', description: 'Taille source non modifiée (Ratio préservé)' },
                  { value: 'scale', label: 'Échelle relative (%)', badge: 'Proportionnel', description: 'Redimensionnement proportionnel en pourcentage' },
                  { value: 'maxWidth', label: 'Largeur max (ex: 1920px)', badge: 'Plafond', description: 'Ajuste la largeur maximale sans agrandir les petites images' },
                  { value: 'custom', label: 'Dimensions sur-mesure', badge: 'Manuel', description: 'Largeur et hauteur personnalisées en pixels' }
                ],
                ariaLabel: 'Mode de redimensionnement'
              })}
            </div>
            <div class="setting-card-footer">
              ${renderResizeSubControls()}
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    // Compressor Settings
    const activePreset = state.compressor.preset;

    return `
      <div class="panel-settings">
        <div class="settings-header">
          <div class="settings-title">
            ${icons.compressor}
            <span>Paramètres du compresseur intelligent</span>
          </div>
          <span class="brand-badge">${COMPRESSION_PRESETS[activePreset]?.label || ''}</span>
        </div>

        <div class="settings-grid">
          <!-- Preset selector cards -->
          <div class="setting-group" style="grid-column: 1 / -1;">
            <label class="setting-label">Préréglage de compression</label>
            <div class="preset-cards">
              ${Object.values(COMPRESSION_PRESETS).map(p => `
                <div class="preset-card ${state.compressor.preset === p.id ? 'is-active' : ''}" data-preset="${p.id}">
                  <span class="preset-name">${p.label}</span>
                  <span class="preset-badge">${p.badge}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Custom Quality Slider (if custom) -->
          ${state.compressor.preset === 'custom' ? `
            <div class="setting-group">
              <label class="setting-label" for="compress-custom-slider">
                <span>Niveau de qualité personnalisé</span>
                <span class="slider-value" id="compress-quality-display">${Math.round(state.compressor.customQuality * 100)}%</span>
              </label>
              <div class="slider-control-box">
                <input type="range" class="slider-custom" id="compress-custom-slider" min="5" max="98" step="1" value="${Math.round(state.compressor.customQuality * 100)}" />
              </div>
              <span class="setting-hint">Un taux de 70-80% est imperceptible à l'œil nu sur écran tout en réduisant drastiquement le poids.</span>
            </div>
          ` : `
            <div class="setting-group">
              <label class="setting-label">Effet attendu</label>
              <p class="setting-hint" style="margin-top: 0.35rem;">${COMPRESSION_PRESETS[activePreset]?.description}</p>
            </div>
          `}

          <!-- Smart WebP Transcoding & Dimension clamping -->
          <div class="setting-group">
            <label class="setting-label">Optimisations complémentaires</label>
            <div style="display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.35rem;">
              <label class="checkbox-label" title="Convertit les JPG et PNG en WebP pour démultiplier le gain d'espace">
                <input type="checkbox" class="checkbox-custom" id="compress-webp-check" ${state.compressor.convertToWebp ? 'checked' : ''} />
                <span><strong>Encoder vers WebP</strong> (Recommandé, gain max de ~80%)</span>
              </label>

              <label class="checkbox-label">
                <input type="checkbox" class="checkbox-custom" id="compress-dimension-check" ${state.compressor.maxDimension > 0 ? 'checked' : ''} />
                <span>Limiter la résolution max (2048px pour les écrans Retina)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Render batch stats and actions toolbar
 */
function renderStatsAndActions() {
  const totalItems = state.items.length;
  if (totalItems === 0) return '';

  const completedItems = state.items.filter(i => i.status === 'success');
  const totalOriginalBytes = state.items.reduce((acc, i) => acc + (i.size || 0), 0);
  const totalOutputBytes = completedItems.reduce((acc, i) => acc + (i.result ? i.result.size : i.size), 0);
  const totalSavedBytes = totalOriginalBytes - totalOutputBytes;
  const savedPercent = totalOriginalBytes > 0 && totalSavedBytes > 0
    ? Math.round((totalSavedBytes / totalOriginalBytes) * 100)
    : 0;

  return `
    <!-- Batch Stats Banner (when items are completed) -->
    ${completedItems.length > 0 ? `
      <section class="stats-summary" aria-label="Bilan du traitement">
        <div class="stats-group">
          <div class="stat-box">
            <span class="stat-label">Images traitées</span>
            <span class="stat-value">${completedItems.length} / ${totalItems}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Poids initial</span>
            <span class="stat-value">${formatBytes(totalOriginalBytes)}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Nouveau poids</span>
            <span class="stat-value">${formatBytes(totalOutputBytes)}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Espace économisé</span>
            <span class="stat-value saved">
              ${totalSavedBytes > 0 ? `-${savedPercent}% (${formatBytes(totalSavedBytes)})` : 'Identique'}
            </span>
          </div>
        </div>
      </section>
    ` : ''}

    <!-- Batch Progress Bar (when active) -->
    ${state.isProcessing ? `
      <div class="batch-progress-wrapper">
        <div class="batch-progress-info">
          <span>Traitement en cours... (${state.batchProgress.completed} / ${state.batchProgress.total})</span>
          <strong>${state.batchProgress.percent}%</strong>
        </div>
        <div class="progress-track">
          <div class="progress-bar" style="width: ${state.batchProgress.percent}%;"></div>
        </div>
      </div>
    ` : ''}

    <!-- Toolbar Actions -->
    <div class="actions-toolbar">
      <div class="actions-left">
        <span style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">
          ${totalItems} image${totalItems > 1 ? 's' : ''} dans la file
        </span>
      </div>

      <div class="actions-right">
        <button class="btn-primary" id="btn-process-all" ${state.isProcessing ? 'disabled' : ''}>
          ${state.isProcessing ? `<span class="spin">${icons.sparkles}</span>` : icons.bolt}
          <span>${state.activeTab === 'convert' ? 'Convertir tout le lot' : 'Compresser tout le lot'}</span>
        </button>

        ${completedItems.length > 0 ? `
          <button class="btn-secondary" id="btn-download-zip" ${state.isZipping ? 'disabled' : ''}>
            ${state.isZipping ? `<span class="spin">${icons.sparkles}</span>` : icons.zip}
            <span>${state.isZipping ? `Création ZIP (${state.zipProgress}%)...` : 'Télécharger tout (.ZIP)'}</span>
          </button>
        ` : ''}

        <button class="btn-danger-text" id="btn-clear-all" ${state.isProcessing ? 'disabled' : ''} title="Effacer toutes les images">
          ${icons.trash}
          <span>Tout effacer</span>
        </button>
      </div>
    </div>
  `;
}

/**
 * Render image items queue list
 */
function renderQueueList() {
  if (state.items.length === 0) {
    return `
      <div class="empty-queue">
        <div class="empty-queue-icon">
          ${icons.upload}
        </div>
        <p style="font-size: 1.05rem; font-weight: 500; color: var(--text-main);">Aucune image en attente</p>
        <p style="font-size: 0.88rem; margin-top: 0.35rem;">Glissez vos images ou dossiers pour démarrer le traitement sans limite.</p>
      </div>
    `;
  }

  return state.items.map((item, idx) => {
    const isDone = item.status === 'success';
    const isProcessing = item.status === 'processing';
    const isError = item.status === 'error';

    return `
      <div class="queue-item" data-id="${item.id}">
        <!-- Thumbnail -->
        <div class="queue-thumb-wrap">
          <img src="${item.thumbUrl}" class="queue-thumb" alt="${item.name}" loading="lazy" />
        </div>

        <!-- Meta -->
        <div class="queue-meta">
          <div class="queue-name" title="${item.name}">${item.name}</div>
          <div class="queue-specs">
            <span class="queue-format-pill">${item.type.split('/')[1] || 'img'}</span>
            <span>${formatBytes(item.size)}</span>
          </div>
        </div>

        <!-- Target Format / Settings indicator -->
        <div class="queue-settings">
          <span class="queue-format-pill" style="background: var(--accent-primary-light); color: var(--accent-primary); font-weight: 600;">
            ➜ ${isDone ? item.result.name.split('.').pop().toUpperCase() : getTargetExtensionForItem(item).toUpperCase()}
          </span>
        </div>

        <!-- Status & Savings -->
        <div class="queue-status">
          ${isProcessing ? `
            <span class="status-badge processing">
              <span class="spin">${icons.sparkles}</span>
              <span>Traitement...</span>
            </span>
          ` : isDone ? `
            <span class="status-badge success">
              ${icons.check}
              <span>${formatBytes(item.result.size)}</span>
            </span>
            ${item.result.savedPercent ? `
              <span class="queue-savings">-${item.result.savedPercent}% économisé</span>
            ` : ''}
          ` : isError ? `
            <span class="status-badge error" title="${item.error || 'Erreur'}">
              Échec
            </span>
          ` : `
            <span class="status-badge pending">
              En attente
            </span>
          `}
        </div>

        <!-- Actions -->
        <div class="queue-actions">
          ${isDone ? `
            <button class="btn-icon-action" data-action="compare" data-id="${item.id}" title="Comparer avant / après">
              ${icons.eye}
            </button>
            <button class="btn-icon-action" data-action="download" data-id="${item.id}" title="Télécharger l'image">
              ${icons.download}
            </button>
          ` : `
            <button class="btn-icon-action" data-action="process-single" data-id="${item.id}" title="Traiter cette image" ${isProcessing ? 'disabled' : ''}>
              ${icons.bolt}
            </button>
          `}
          <button class="btn-icon-action delete" data-action="delete" data-id="${item.id}" title="Supprimer de la file" ${isProcessing ? 'disabled' : ''}>
            ${icons.trash}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Determine target extension for an item
 */
function getTargetExtensionForItem(item) {
  if (state.activeTab === 'convert') {
    const map = {
      'image/webp': 'webp',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/avif': 'avif',
      'image/bmp': 'bmp',
      'image/x-icon': 'ico'
    };
    return map[state.converter.targetMime] || 'webp';
  } else {
    return state.compressor.convertToWebp ? 'webp' : (item.name.split('.').pop() || 'webp');
  }
}

/**
 * Render Before/After comparison modal
 */
function renderModal() {
  if (!state.modalItem || !state.modalItem.result) return '';

  const item = state.modalItem;
  const origSize = formatBytes(item.size);
  const newSize = formatBytes(item.result.size);
  const diffPercent = item.result.savedPercent || Math.round((1 - (item.result.size / item.size)) * 100);

  return `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-header">
          <h3 class="modal-title" id="modal-title">Comparatif Avant / Après</h3>
          <button class="btn-icon-action" id="btn-modal-close" aria-label="Fermer la boîte de dialogue">
            ${icons.close}
          </button>
        </div>

        <div class="modal-body">
          <div class="compare-grid">
            <!-- Left: Original -->
            <div class="compare-side">
              <strong>Original</strong>
              <div class="compare-img-box">
                <img src="${item.thumbUrl}" class="compare-img" alt="Original" />
              </div>
              <div class="compare-meta">
                <span>Poids : <strong>${origSize}</strong></span>
                <span>Dim : ${item.result.srcWidth || '?'} × ${item.result.srcHeight || '?'}</span>
              </div>
            </div>

            <!-- Right: Converted/Compressed -->
            <div class="compare-side">
              <strong style="color: var(--accent-sage);">Résultat (${diffPercent > 0 ? `-${diffPercent}%` : 'Sans perte'})</strong>
              <div class="compare-img-box">
                <img src="${item.result.url}" class="compare-img" alt="Résultat" />
              </div>
              <div class="compare-meta">
                <span>Poids : <strong style="color: var(--accent-sage);">${newSize}</strong></span>
                <span>Dim : ${item.result.width} × ${item.result.height}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" id="btn-modal-cancel">Fermer</button>
          <button class="btn-primary" id="btn-modal-download">
            ${icons.download}
            <span>Télécharger (${item.result.name})</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Event Listeners & Interactive Handlers
 */
function bindEventListeners() {
  // Theme Toggle
  document.querySelector('#btn-theme-toggle')?.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('clemverter_theme', state.theme);
    document.documentElement.setAttribute('data-theme', state.theme);
    updateFavicon(state.theme);
    renderApp();
  });

  // Banner Dismiss
  document.querySelector('#btn-close-banner')?.addEventListener('click', () => {
    state.showBanner = false;
    localStorage.setItem('clemverter_banner_dismissed', 'true');
    renderApp();
  });

  // Lofi Audio Toggle
  document.querySelector('#btn-lofi-toggle')?.addEventListener('click', () => {
    lofiAudio.toggle();
    renderApp();
  });


  // Tabs
  document.querySelector('#tab-convert')?.addEventListener('click', () => {
    if (state.activeTab !== 'convert') {
      state.activeTab = 'convert';
      renderApp();
    }
  });

  document.querySelector('#tab-compress')?.addEventListener('click', () => {
    if (state.activeTab !== 'compress') {
      state.activeTab = 'compress';
      renderApp();
    }
  });

  // File Browse Button
  const fileInput = document.querySelector('#file-input');
  document.querySelector('#btn-browse-files')?.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput?.click();
  });

  const dropzone = document.querySelector('#dropzone');
  dropzone?.addEventListener('click', () => {
    fileInput?.click();
  });

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(Array.from(e.target.files));
      fileInput.value = '';
    }
  });

  // Drag and Drop (Files & Folders)
  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('is-dragover');
  });

  dropzone?.addEventListener('dragleave', () => {
    dropzone.classList.remove('is-dragover');
  });

  dropzone?.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropzone.classList.remove('is-dragover');

    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      const files = await traverseDataTransferItems(items);
      addFilesToQueue(files);
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(Array.from(e.dataTransfer.files));
    }
  });

  // Custom Select Dropdowns Initialization
  initCustomSelects((selectId, value) => {
    if (selectId === 'convert-format-select') {
      state.converter.targetMime = value;
      const fmt = OUTPUT_FORMATS.find(f => f.id === value);
      if (fmt && fmt.defaultQuality) {
        state.converter.quality = fmt.defaultQuality;
      }
      renderApp();
    } else if (selectId === 'convert-resize-select') {
      state.converter.resizeMode = value;
      renderApp();
    } else if (selectId === 'lofi-track-select') {
      lofiAudio.setTrack(value);
      renderApp();
    }
  });

  // Converter Settings Handlers
  document.querySelector('#convert-quality-slider')?.addEventListener('input', (e) => {
    state.converter.quality = parseInt(e.target.value, 10) / 100;
    const disp = document.querySelector('#quality-val-display');
    if (disp) disp.textContent = `${e.target.value}%`;
  });

  document.querySelector('#convert-lossless-check')?.addEventListener('change', (e) => {
    state.converter.lossless = e.target.checked;
  });

  document.querySelector('#convert-scale-slider')?.addEventListener('input', (e) => {
    state.converter.scalePercent = parseInt(e.target.value, 10);
    const disp = document.querySelector('#scale-val-display');
    if (disp) disp.textContent = `${e.target.value}%`;
  });

  document.querySelector('#convert-max-width')?.addEventListener('input', (e) => {
    state.converter.maxWidth = parseInt(e.target.value, 10) || 1920;
  });

  document.querySelector('#convert-custom-w')?.addEventListener('input', (e) => {
    state.converter.customWidth = e.target.value;
  });

  document.querySelector('#convert-custom-h')?.addEventListener('input', (e) => {
    state.converter.customHeight = e.target.value;
  });

  document.querySelector('#convert-aspect-check')?.addEventListener('change', (e) => {
    state.converter.keepAspectRatio = e.target.checked;
  });

  // Compressor Settings Handlers
  document.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => {
      const p = card.getAttribute('data-preset');
      if (p) {
        state.compressor.preset = p;
        renderApp();
      }
    });
  });

  document.querySelector('#compress-custom-slider')?.addEventListener('input', (e) => {
    state.compressor.customQuality = parseInt(e.target.value, 10) / 100;
    const disp = document.querySelector('#compress-quality-display');
    if (disp) disp.textContent = `${e.target.value}%`;
  });

  document.querySelector('#compress-webp-check')?.addEventListener('change', (e) => {
    state.compressor.convertToWebp = e.target.checked;
  });

  document.querySelector('#compress-dimension-check')?.addEventListener('change', (e) => {
    state.compressor.maxDimension = e.target.checked ? 2048 : 0;
  });

  // Batch Toolbar Handlers
  document.querySelector('#btn-process-all')?.addEventListener('click', () => {
    processAllImages();
  });

  document.querySelector('#btn-download-zip')?.addEventListener('click', () => {
    downloadBatchZip();
  });

  document.querySelector('#btn-clear-all')?.addEventListener('click', () => {
    clearAllQueue();
  });

  // Queue item action delegator
  document.querySelector('#queue-container')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    const item = state.items.find(i => i.id === id);
    if (!item) return;

    if (action === 'delete') {
      deleteQueueItem(id);
    } else if (action === 'process-single') {
      processSingleItem(item);
    } else if (action === 'download') {
      if (item.result && item.result.blob) {
        downloadSingleFile(item.result.blob, item.result.name);
      }
    } else if (action === 'compare') {
      openCompareModal(item);
    }
  });

  // Modal Handlers
  document.querySelector('#btn-modal-close')?.addEventListener('click', closeModal);
  document.querySelector('#btn-modal-cancel')?.addEventListener('click', closeModal);
  document.querySelector('#modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  });

  document.querySelector('#btn-modal-download')?.addEventListener('click', () => {
    if (state.modalItem && state.modalItem.result) {
      downloadSingleFile(state.modalItem.result.blob, state.modalItem.result.name);
    }
  });
}

/**
 * Traverses drag & drop items recursively (handles folders with multiple sub-images!)
 */
async function traverseDataTransferItems(items) {
  const files = [];

  async function traverseEntry(entry) {
    if (!entry) return;
    if (entry.isFile) {
      const file = await new Promise((resolve) => entry.file(resolve));
      if (file && (file.type.startsWith('image/') || /\.(webp|png|jpe?g|gif|avif|svg|bmp|ico|heic|heif|tiff?)$/i.test(file.name))) {
        files.push(file);
      }
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const entries = await new Promise((resolve) => {
        dirReader.readEntries(resolve);
      });
      for (const subEntry of entries) {
        await traverseEntry(subEntry);
      }
    }
  }

  for (const item of items) {
    if (item.webkitGetAsEntry) {
      const entry = item.webkitGetAsEntry();
      if (entry) await traverseEntry(entry);
    } else {
      const file = item.getAsFile();
      if (file) files.push(file);
    }
  }

  return files;
}

/**
 * Add files to queue
 */
function addFilesToQueue(fileList) {
  const newItems = fileList.filter(f => {
    return f.type.startsWith('image/') || /\.(webp|png|jpe?g|gif|avif|svg|bmp|ico|heic|heif|tiff?)$/i.test(f.name);
  }).map(file => {
    return {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: detectFormat(file),
      thumbUrl: URL.createObjectURL(file),
      status: 'pending',
      result: null,
      error: null
    };
  });

  if (newItems.length > 0) {
    state.items = [...state.items, ...newItems];
    renderApp();
  }
}

/**
 * Process a single image
 */
async function processSingleItem(item) {
  item.status = 'processing';
  renderApp();

  try {
    let res;
    if (state.activeTab === 'convert') {
      res = await convertImage(item.file, state.converter);
    } else {
      res = await compressImage(item.file, state.compressor);
    }
    item.status = 'success';
    item.result = res;
  } catch (err) {
    console.error(err);
    item.status = 'error';
    item.error = err.message || 'Erreur inconnue';
  }

  renderApp();
}

/**
 * Process all queued images in batch
 */
async function processAllImages() {
  if (state.isProcessing || state.items.length === 0) return;

  state.isProcessing = true;
  state.batchProgress = { completed: 0, total: state.items.length, percent: 0 };
  renderApp();

  const queueItems = state.items.map(item => ({
    id: item.id,
    file: item.file,
    options: state.activeTab === 'convert' ? { ...state.converter } : { ...state.compressor }
  }));

  if (state.activeTab === 'convert') {
    await processBatchQueue({
      items: queueItems,
      concurrency: 4,
      onItemStart: (qi) => {
        const item = state.items.find(i => i.id === qi.id);
        if (item) {
          item.status = 'processing';
          renderApp();
        }
      },
      onItemProgress: ({ status, item: qi, result, error }) => {
        const item = state.items.find(i => i.id === qi.id);
        if (item) {
          item.status = status;
          if (status === 'success') {
            item.result = result;
          } else {
            item.error = error;
          }
          renderApp();
        }
      },
      onBatchProgress: (progress) => {
        state.batchProgress = progress;
        renderApp();
      }
    });
  } else {
    // Compressor batch execution
    const total = state.items.length;
    let completed = 0;
    const concurrency = 4;
    let idx = 0;

    async function compWorker() {
      while (idx < total) {
        const curIdx = idx++;
        const item = state.items[curIdx];
        item.status = 'processing';
        renderApp();

        try {
          const res = await compressImage(item.file, state.compressor);
          item.status = 'success';
          item.result = res;
        } catch (err) {
          item.status = 'error';
          item.error = err.message;
        }

        completed++;
        state.batchProgress = {
          completed,
          total,
          percent: Math.round((completed / total) * 100)
        };
        renderApp();
      }
    }

    const workers = Array.from({ length: Math.min(concurrency, total) }, () => compWorker());
    await Promise.all(workers);
  }

  state.isProcessing = false;
  renderApp();
}

/**
 * Download all completed files as a single ZIP archive
 */
async function downloadBatchZip() {
  const completed = state.items.filter(i => i.status === 'success' && i.result);
  if (completed.length === 0 || state.isZipping) return;

  state.isZipping = true;
  state.zipProgress = 0;
  renderApp();

  const zipName = state.activeTab === 'convert'
    ? `clemverter_conversion_${Date.now()}.zip`
    : `clemverter_compressed_${Date.now()}.zip`;

  try {
    await exportBatchAsZip(completed, zipName, (percent) => {
      state.zipProgress = percent;
      renderApp();
    });
  } catch (err) {
    console.error('Failed to create ZIP:', err);
    alert('Une erreur est survenue lors de la création du fichier ZIP.');
  } finally {
    state.isZipping = false;
    renderApp();
  }
}

/**
 * Remove an item from the queue and free object URLs
 */
function deleteQueueItem(id) {
  const itemIndex = state.items.findIndex(i => i.id === id);
  if (itemIndex >= 0) {
    const item = state.items[itemIndex];
    if (item.thumbUrl) URL.revokeObjectURL(item.thumbUrl);
    if (item.result && item.result.url) URL.revokeObjectURL(item.result.url);
    state.items.splice(itemIndex, 1);
    renderApp();
  }
}

/**
 * Clear entire queue
 */
function clearAllQueue() {
  state.items.forEach(item => {
    if (item.thumbUrl) URL.revokeObjectURL(item.thumbUrl);
    if (item.result && item.result.url) URL.revokeObjectURL(item.result.url);
  });
  state.items = [];
  renderApp();
}

/**
 * Open Before/After comparison modal
 */
function openCompareModal(item) {
  state.modalItem = item;
  renderApp();
}

function closeModal() {
  state.modalItem = null;
  renderApp();
}

// Global Clipboard Paste Listener (Ctrl+V / Cmd+V anywhere to paste images)
window.addEventListener('paste', (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;

  const pastedFiles = [];
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        // Name screenshot nicely
        const ext = file.type.split('/')[1] || 'png';
        const renamedFile = new File([file], `capture_pressepapier_${Date.now()}.${ext}`, { type: file.type });
        pastedFiles.push(renamedFile);
      }
    }
  }

  if (pastedFiles.length > 0) {
    addFilesToQueue(pastedFiles);
  }
});

// Remove unused Vite counter.js and assets if needed
// Initial render
renderApp();
