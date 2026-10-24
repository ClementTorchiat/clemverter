# ☕ clemverter — L'Atelier d'Images Cozy & Lo-Fi

Outil en ligne moderne, minimaliste et sans compromis pour **convertir** et **compresser** vos images directement dans votre navigateur web.

---

## ✨ Points forts & Philosophie

- ♾️ **Aucune limite journalière ni de quota** : Le traitement est exécuté à **100% sur votre machine** (in-browser) grâce aux technologies Canvas, `createImageBitmap` et aux Web Workers asynchrones.
- 🔒 **Confidentialité absolue** : Vos photos ne quittent jamais votre ordinateur. Aucun envoi sur un serveur externe.
- ⚡ **Support de masse (Batch)** : Traitez 10, 50 ou 500 images à la fois sans bloquer l'interface grâce à notre file d'attente à concurrence contrôlée.
- 📦 **Téléchargement individuel ou en lot (.ZIP)** : Exportez toutes vos images optimisées en un clic avec JSZip.
- 🌧️ **Ambiance Lo-Fi intégrée** : Lecteur d'ambiance sonore générative (pluie douce, crépitement de vinyle chaud) via l'API Web Audio, 100% hors-ligne.
- 🌓 **Thèmes Cozy** : Basculez entre le thème **Café Doux** (crème / lin chaud) et le thème **Nuit Lo-Fi** (minuit chaud / teintes ambrées).

---

## 🎨 Les Deux Sections

### 1. 🔄 Convertisseur
- **Formats d'exportation supportés** :
  - **WebP** *(Recommandé)* : Qualité réglable (1-100%) ou mode sans perte (*lossless*).
  - **PNG** : Qualité sans perte avec canal alpha (transparence).
  - **JPEG / JPG** : Compatibilité universelle, compression avec curseur de qualité.
  - **AVIF** : Format nouvelle génération ultra-performant.
  - **BMP** : Format bitmap Windows non compressé (encodeur natif 24-bit).
  - **ICO** : Générateur de favicons et icônes d'application (16×16, 32×32, 48×48...).
- **Options de redimensionnement** :
  - Conserver les dimensions originales (100%)
  - Échelle proportionnelle en pourcentage (ex: 75%, 50%, 25%)
  - Largeur maximale (ex: 1920px pour le Web)
  - Dimensions personnalisées avec verrouillage du ratio d'aspect.

### 2. 🗜️ Compresseur
- **Préréglages intelligents en 1 clic** :
  - 🌿 **Doux (Fidélité max)** : Qualité 85%, préservation des micro-détails.
  - ☕ **Équilibré (Recommandé)** : Qualité 75%, le compromis idéal invisibilité / gain d'espace de ~60-80%.
  - ⚡ **Ultra Éco (Poids plume)** : Qualité 52%, pour les pages ultra-rapides et mobiles.
  - 🎛️ **Personnalisé** : Curseur précis de 1% à 100%.
- **Transcodage intelligent vers WebP** : Gain d'espace supplémentaire majeur lors de la compression.
- **Comparateur Avant / Après** : Modal interactive pour inspecter la netteté et les gains de poids avant téléchargement.

---

## 📂 Formats d'entrée acceptés
- **WebP**, **PNG**, **JPEG/JPG**, **AVIF**, **GIF**, **SVG**, **BMP**, **ICO**, **HEIC/HEIF** (photos iPhone Apple via transcodeur dynamique), **TIFF**.

---

## 🚀 Démarrage rapide

```bash
# Installation des dépendances
npm install

# Démarrer le serveur de développement local
npm run dev

# Compiler pour la production (bundle optimisé)
npm run build
```

Accédez ensuite à l'application dans votre navigateur : `http://localhost:5173`.
