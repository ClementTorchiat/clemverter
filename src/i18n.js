/**
 * clemverter - Internationalization (i18n) Module
 * Supports French (fr) and English (en) with full translations,
 * dynamic parameter interpolation, and reactive language state.
 */

// Active language in memory
let currentLang = 'fr';

/**
 * Detect default language from localStorage or browser preferences
 * @returns {'fr' | 'en'}
 */
export function detectDefaultLanguage() {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('clemverter_lang');
      if (saved === 'fr' || saved === 'en') {
        return saved;
      }
    }
  } catch (e) {
    console.warn('Could not read clemverter_lang from localStorage', e);
  }

  const browserLang = (typeof navigator !== 'undefined' && navigator.language)
    ? navigator.language.toLowerCase()
    : 'fr';

  return browserLang.startsWith('en') ? 'en' : 'fr';
}

currentLang = detectDefaultLanguage();

/**
 * Get current active language
 * @returns {'fr' | 'en'}
 */
export function getActiveLanguage() {
  return currentLang;
}

/**
 * Set active language and persist to localStorage
 * @param {'fr' | 'en'} lang
 */
export function setActiveLanguage(lang) {
  if (lang === 'fr' || lang === 'en') {
    currentLang = lang;
    try {
      localStorage.setItem('clemverter_lang', lang);
    } catch (e) {
      console.warn('Could not persist clemverter_lang', e);
    }
  }
}

/**
 * Dictionaries for FR and EN
 */
export const translations = {
  fr: {
    // Meta & Head
    metaTitle: "clemverter — Convertisseur & Compresseur d'images Cozy & Illimité",
    metaDescription: "Outil lofi et minimaliste de conversion et compression d'images 100% dans votre navigateur. Aucune limite de taille ni de quota journalier. Support ultra-rapide du WebP, AVIF, PNG, JPEG, HEIC.",
    ogTitle: "clemverter — Convertisseur & Compresseur d'images Cozy & Illimité",
    ogDescription: "Convertissez et compressez vos images sans limite journalière, 100% en local et respectueux de votre vie privée.",

    // Header
    brandTagline: "Convertisseur & compresseur d'images local et illimité.",
    lofiTitle: "Ambiance sonore relaxante (Générée localement)",
    lofiPlaying: "En pause",
    lofiStopped: "Ambiance lofi",
    lofiRain: "Pluie douce",
    lofiVinyl: "Vinyle chaud",
    lofiSelectAria: "Choix du son lofi",
    langSelectTitle: "Changer de langue",
    langSelectAria: "Sélectionner la langue",
    langFr: "Français",
    langEn: "English",
    themeToggleTitle: "Basculer entre thème Café et Nuit Lofi",
    themeToggleAria: "Thème sombre / clair",

    // Value Proposition Banner
    bannerAria: "Avantages de clemverter",
    bannerLimit: "<strong>Zéro limite :</strong> Traitez autant d'images que souhaité en un seul lot.",
    bannerPrivate: "<strong>100% Privé :</strong> Tout est calculé dans votre navigateur, aucun envoi serveur.",
    bannerWebp: "<strong>Format WebP :</strong> Réduction de poids record avec ou sans perte.",
    bannerCloseTitle: "Masquer ce message",
    bannerCloseAria: "Fermer la boîte d'information",

    // Navigation Tabs
    tabNavAria: "Navigation des modes",
    tabConvert: "Convertisseur",
    tabConvertBadge: "WebP / AVIF / JPG...",
    tabCompress: "Compresseur",
    tabCompressBadge: "-70% en moyenne",

    // Dropzone
    dropzoneAria: "Zone de dépôt des images",
    dropzoneTitle: "Glissez vos images ou dossiers ici",
    dropzoneDesc: "Déposez un nombre illimité de fichiers ou collez directement une image depuis votre presse-papiers (<kbd>Ctrl+V</kbd> / <kbd>Cmd+V</kbd>).",
    dropzoneBrowse: "Parcourir les fichiers",

    // Converter Settings Panel
    convSettingsTitle: "Paramètres de conversion globale",
    convFormatSelected: "{format} sélectionné",
    convCardFormatTitle: "Format de sortie",
    convCardQualityTitle: "Qualité de compression",
    convCardResizeTitle: "Redimensionnement",
    convLossless: "Sans perte",
    convQualitySliderAria: "Qualité de compression",
    convLosslessDefault: "Format sans perte (Lossless) par défaut",
    convLosslessMode: "Mode Sans Perte (Lossless)",
    convOptimalQuality: "Qualité optimale préservée sans artéfacts",
    convResizeOriginal: "Conserver dimensions",
    convResizeOriginalBadge: "100%",
    convResizeOriginalDesc: "Taille source non modifiée (Ratio préservé)",
    convResizeScale: "Échelle relative (%)",
    convResizeScaleBadge: "Proportionnel",
    convResizeScaleDesc: "Redimensionnement proportionnel en pourcentage",
    convResizeMaxWidth: "Largeur max (ex: 1920px)",
    convResizeMaxWidthBadge: "Plafond",
    convResizeMaxWidthDesc: "Ajuste la largeur maximale sans agrandir les petites images",
    convResizeCustom: "Dimensions sur-mesure",
    convResizeCustomBadge: "Manuel",
    convResizeCustomDesc: "Largeur et hauteur personnalisées en pixels",
    convResizeOriginalHint: "Ratio & dimensions d'origine préservés",
    convScaleSliderAria: "Échelle relative",
    convMaxWidthPlaceholder: "Largeur max",
    convMaxWidthAria: "Largeur maximale",
    convCustomWPlaceholder: "Larg.",
    convCustomWAria: "Largeur",
    convCustomHPlaceholder: "Haut.",
    convCustomHAria: "Hauteur",
    convKeepRatioTitle: "Garder le ratio",
    convKeepRatioLabel: "Ratio",
    convCustomBadge: "Sur-mesure",

    // Compressor Settings Panel
    compSettingsTitle: "Paramètres du compresseur intelligent",
    compPresetLabel: "Préréglage de compression",
    compCustomQualityLabel: "Niveau de qualité personnalisé",
    compCustomQualityHint: "Un taux de 70-80% est imperceptible à l'œil nu sur écran tout en réduisant drastiquement le poids.",
    compExpectedEffect: "Effet attendu",
    compAdditionalOpts: "Optimisations complémentaires",
    compWebpTitle: "Convertit les JPG et PNG en WebP pour démultiplier le gain d'espace",
    compWebpText: "<strong>Encoder vers WebP</strong> (Recommandé, gain max de ~80%)",
    compDimensionClamp: "Limiter la résolution max (2048px pour les écrans Retina)",

    // Stats & Actions Dashboard
    statsSummaryAria: "Bilan du traitement",
    statsProcessedImages: "Images traitées",
    statsOriginalSize: "Poids initial",
    statsNewSize: "Nouveau poids",
    statsSavedSpace: "Espace économisé",
    statsIdentical: "Identique",
    statsProcessing: "Traitement en cours... ({completed} / {total})",
    queueCount: "{count} image{s} dans la file",
    btnProcessConvert: "Convertir tout le lot",
    btnProcessCompress: "Compresser tout le lot",
    btnZipping: "Création ZIP ({percent}%)...",
    btnDownloadZip: "Télécharger tout (.ZIP)",
    btnClearAllTitle: "Effacer toutes les images",
    btnClearAll: "Tout effacer",

    // Images Queue
    queueAria: "Liste des images",
    emptyQueueTitle: "Aucune image en attente",
    emptyQueueDesc: "Glissez vos images ou dossiers pour démarrer le traitement sans limite.",
    statusProcessing: "Traitement...",
    statusSaved: "-{percent}% économisé",
    statusError: "Échec",
    statusPending: "En attente",
    actionCompareTitle: "Comparer avant / après",
    actionDownloadTitle: "Télécharger l'image",
    actionProcessSingleTitle: "Traiter cette image",
    actionDeleteTitle: "Supprimer de la file",

    // Comparison Modal
    modalTitle: "Comparatif Avant / Après",
    modalCloseAria: "Fermer la boîte de dialogue",
    modalOriginal: "Original",
    modalResult: "Résultat ({diff})",
    modalLossless: "Sans perte",
    modalSize: "Poids :",
    modalDim: "Dim :",
    modalCancel: "Fermer",
    modalDownload: "Télécharger ({name})",

    // Footer
    footerBrand: "<strong>clemverter</strong> — L'atelier d'images open web.",
    footerSpecs: "<span>Traitement 100% in-browser • Zéro tracking • Sans publicité</span>",

    // Errors & Fallbacks
    zipError: "Une erreur est survenue lors de la création du fichier ZIP.",
    unknownError: "Erreur inconnue",
    processingError: "Erreur de traitement",
    clipboardCapture: "capture_pressepapier"
  },

  en: {
    // Meta & Head
    metaTitle: "clemverter — Cozy & Unlimited Image Converter & Compressor",
    metaDescription: "Minimalist and lofi in-browser image converter and compressor. 100% local, no file size limit, no daily quota. Ultra-fast WebP, AVIF, PNG, JPEG, HEIC support.",
    ogTitle: "clemverter — Cozy & Unlimited Image Converter & Compressor",
    ogDescription: "Convert and compress your images with no daily limits, 100% locally and privacy-friendly.",

    // Header
    brandTagline: "Local and unlimited image converter & compressor.",
    lofiTitle: "Relaxing ambient sound (Locally generated)",
    lofiPlaying: "Paused",
    lofiStopped: "Lofi ambiance",
    lofiRain: "Gentle rain",
    lofiVinyl: "Warm vinyl",
    lofiSelectAria: "Choose lofi sound",
    langSelectTitle: "Change language",
    langSelectAria: "Select language",
    langFr: "Français",
    langEn: "English",
    themeToggleTitle: "Toggle Coffee and Lofi Night theme",
    themeToggleAria: "Dark / light theme",

    // Value Proposition Banner
    bannerAria: "clemverter advantages",
    bannerLimit: "<strong>Zero limits:</strong> Process as many images as you like in a single batch.",
    bannerPrivate: "<strong>100% Private:</strong> Everything is computed in your browser, no server upload.",
    bannerWebp: "<strong>WebP format:</strong> Record-breaking file size reduction, lossy or lossless.",
    bannerCloseTitle: "Dismiss this message",
    bannerCloseAria: "Close information box",

    // Navigation Tabs
    tabNavAria: "Mode navigation",
    tabConvert: "Converter",
    tabConvertBadge: "WebP / AVIF / JPG...",
    tabCompress: "Compressor",
    tabCompressBadge: "-70% on average",

    // Dropzone
    dropzoneAria: "Image drop zone",
    dropzoneTitle: "Drag your images or folders here",
    dropzoneDesc: "Drop an unlimited number of files or paste directly from your clipboard (<kbd>Ctrl+V</kbd> / <kbd>Cmd+V</kbd>).",
    dropzoneBrowse: "Browse files",

    // Converter Settings Panel
    convSettingsTitle: "Global conversion settings",
    convFormatSelected: "{format} selected",
    convCardFormatTitle: "Output format",
    convCardQualityTitle: "Compression quality",
    convCardResizeTitle: "Resizing",
    convLossless: "Lossless",
    convQualitySliderAria: "Compression quality",
    convLosslessDefault: "Lossless format by default",
    convLosslessMode: "Lossless Mode",
    convOptimalQuality: "Optimal quality preserved without artifacts",
    convResizeOriginal: "Keep dimensions",
    convResizeOriginalBadge: "100%",
    convResizeOriginalDesc: "Unmodified source dimensions (Aspect ratio preserved)",
    convResizeScale: "Relative scale (%)",
    convResizeScaleBadge: "Proportional",
    convResizeScaleDesc: "Proportional percentage resize",
    convResizeMaxWidth: "Max width (e.g. 1920px)",
    convResizeMaxWidthBadge: "Cap",
    convResizeMaxWidthDesc: "Clamps maximum width without upscaling smaller images",
    convResizeCustom: "Custom dimensions",
    convResizeCustomBadge: "Manual",
    convResizeCustomDesc: "Custom width and height in pixels",
    convResizeOriginalHint: "Original ratio & dimensions preserved",
    convScaleSliderAria: "Relative scale",
    convMaxWidthPlaceholder: "Max width",
    convMaxWidthAria: "Maximum width",
    convCustomWPlaceholder: "Width",
    convCustomWAria: "Width",
    convCustomHPlaceholder: "Height",
    convCustomHAria: "Height",
    convKeepRatioTitle: "Keep ratio",
    convKeepRatioLabel: "Ratio",
    convCustomBadge: "Custom",

    // Compressor Settings Panel
    compSettingsTitle: "Smart compressor settings",
    compPresetLabel: "Compression preset",
    compCustomQualityLabel: "Custom quality level",
    compCustomQualityHint: "A 70-80% quality level is virtually indistinguishable on screens while drastically cutting file size.",
    compExpectedEffect: "Expected outcome",
    compAdditionalOpts: "Additional optimizations",
    compWebpTitle: "Converts JPG and PNG to WebP to maximize space savings",
    compWebpText: "<strong>Encode to WebP</strong> (Recommended, up to ~80% savings)",
    compDimensionClamp: "Limit max resolution (2048px for Retina displays)",

    // Stats & Actions Dashboard
    statsSummaryAria: "Processing summary",
    statsProcessedImages: "Processed images",
    statsOriginalSize: "Original size",
    statsNewSize: "New size",
    statsSavedSpace: "Saved space",
    statsIdentical: "Identical",
    statsProcessing: "Processing in progress... ({completed} / {total})",
    queueCount: "{count} image{s} in queue",
    btnProcessConvert: "Convert entire batch",
    btnProcessCompress: "Compress entire batch",
    btnZipping: "Creating ZIP ({percent}%)...",
    btnDownloadZip: "Download all (.ZIP)",
    btnClearAllTitle: "Clear all images",
    btnClearAll: "Clear all",

    // Images Queue
    queueAria: "Image queue",
    emptyQueueTitle: "No images in queue",
    emptyQueueDesc: "Drag and drop your images or folders to start unlimited processing.",
    statusProcessing: "Processing...",
    statusSaved: "-{percent}% saved",
    statusError: "Failed",
    statusPending: "Pending",
    actionCompareTitle: "Compare before / after",
    actionDownloadTitle: "Download image",
    actionProcessSingleTitle: "Process this image",
    actionDeleteTitle: "Remove from queue",

    // Comparison Modal
    modalTitle: "Before / After Comparison",
    modalCloseAria: "Close dialog",
    modalOriginal: "Original",
    modalResult: "Result ({diff})",
    modalLossless: "Lossless",
    modalSize: "Size:",
    modalDim: "Dim:",
    modalCancel: "Close",
    modalDownload: "Download ({name})",

    // Footer
    footerBrand: "<strong>clemverter</strong> — The open web image workshop.",
    footerSpecs: "<span>100% in-browser processing • Zero tracking • Ad-free</span>",

    // Errors & Fallbacks
    zipError: "An error occurred while creating the ZIP file.",
    unknownError: "Unknown error",
    processingError: "Processing error",
    clipboardCapture: "clipboard_capture"
  }
};

/**
 * Translate a key into the active language with parameter substitution
 * @param {string} key - Translation key
 * @param {Record<string, string|number>} [params] - Key-value replacements
 * @param {'fr' | 'en'} [lang] - Optional language override
 * @returns {string}
 */
export function t(key, params = {}, lang = null) {
  const chosenLang = lang || currentLang;
  const dict = translations[chosenLang] || translations.fr;
  let text = dict[key] !== undefined ? dict[key] : (translations.fr[key] || key);

  if (params && typeof params === 'object') {
    Object.keys(params).forEach(param => {
      text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), String(params[param]));
    });
  }

  return text;
}

/**
 * Localized Output Formats
 * @param {'fr' | 'en'} [lang]
 */
export function getOutputFormats(lang = null) {
  const isEn = (lang || currentLang) === 'en';

  return [
    {
      id: 'image/webp',
      ext: 'webp',
      name: 'WebP',
      badge: isEn ? 'Recommended' : 'Recommandé',
      badgeClass: 'badge-recommended',
      description: isEn
        ? 'Modern web format, ultra-efficient compression with or without quality loss.'
        : 'Format moderne idéal pour le web, compression ultra-efficace avec ou sans perte.',
      supportsQuality: true,
      supportsLossless: true,
      defaultQuality: 0.82
    },
    {
      id: 'image/jpeg',
      ext: 'jpg',
      name: 'JPEG / JPG',
      badge: isEn ? 'Universal' : 'Universel',
      badgeClass: 'badge-neutral',
      description: isEn
        ? 'Universal compatibility with all platforms and devices.'
        : 'Compatibilité universelle avec toutes les plateformes et appareils.',
      supportsQuality: true,
      supportsLossless: false,
      defaultQuality: 0.85
    },
    {
      id: 'image/png',
      ext: 'png',
      name: 'PNG',
      badge: isEn ? 'Lossless' : 'Sans perte',
      badgeClass: 'badge-neutral',
      description: isEn
        ? 'Flawless quality with alpha transparency, ideal for logos and graphics.'
        : 'Qualité parfaite avec transparence alpha, idéal pour logos et graphiques.',
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
      description: isEn
        ? 'Next-generation compression derived from the AV1 video codec.'
        : 'Compression de nouvelle génération dérivée du codec AV1.',
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
      description: isEn
        ? 'Standard uncompressed bitmap format for Windows.'
        : 'Format bitmap non compressé standard pour Windows.',
      supportsQuality: false,
      supportsLossless: true,
      defaultQuality: 1.0
    },
    {
      id: 'image/x-icon',
      ext: 'ico',
      name: 'ICO (Favicon)',
      badge: isEn ? 'Icon' : 'Icône',
      badgeClass: 'badge-neutral',
      description: isEn
        ? 'Website / application icon (16x16, 32x32, 48x48, 64x64 or original).'
        : 'Icône de site web / application (16x16, 32x32, 48x48, 64x64 ou original).',
      supportsQuality: false,
      supportsLossless: true,
      defaultQuality: 1.0
    }
  ];
}

/**
 * Localized Compression Presets
 * @param {'fr' | 'en'} [lang]
 */
export function getCompressionPresets(lang = null) {
  const isEn = (lang || currentLang) === 'en';

  return {
    gentle: {
      id: 'gentle',
      label: isEn ? 'Gentle (Max fidelity)' : 'Doux (Fidélité max)',
      badge: isEn ? 'Quality 85%' : 'Qualité 85%',
      quality: 0.85,
      description: isEn
        ? 'Maximum preservation of the finest details. Recommended for fine-art photography and portfolios.'
        : 'Préservation maximale des détails les plus fins. Recommandé pour la photo d\'art et les portfolios.'
    },
    balanced: {
      id: 'balanced',
      label: isEn ? 'Balanced (Recommended)' : 'Équilibré (Recommandé)',
      badge: isEn ? 'Quality 75%' : 'Qualité 75%',
      quality: 0.75,
      description: isEn
        ? 'The sweet spot: virtually imperceptible visual loss and 60 to 80% file size savings.'
        : 'Le parfait compromis : perte visuelle quasi imperceptible et gain de poids de 60 à 80%.'
    },
    eco: {
      id: 'eco',
      label: isEn ? 'Ultra Eco (Lightweight)' : 'Ultra Éco (Poids plume)',
      badge: isEn ? 'Quality 52%' : 'Qualité 52%',
      quality: 0.52,
      description: isEn
        ? 'Aggressive compression for instant loading on mobile devices and slower connections.'
        : 'Compression agressive pour un chargement instantané sur mobile et réseaux lents.'
    },
    custom: {
      id: 'custom',
      label: isEn ? 'Custom' : 'Personnalisé',
      badge: isEn ? 'Tailored' : 'Sur-mesure',
      quality: 0.75,
      description: isEn
        ? 'Fine-tune the quality slider from 1% to 100% according to your specific needs.'
        : 'Réglez précisément le curseur de qualité de 1% à 100% selon vos exigences.'
    }
  };
}
