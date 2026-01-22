# VIVR Visual Search - Extension Chrome

Extension Chrome pour trouver des produits déco similaires à partir de n'importe quelle image sur le web.

## Fonctionnalités

- **Clic droit sur image** : Faites un clic droit sur n'importe quelle image pour l'analyser
- **Upload d'image** : Glissez-déposez ou sélectionnez une image depuis votre ordinateur
- **URL d'image** : Collez l'URL d'une image pour l'analyser
- **Analyse IA** : Détection automatique des objets, couleurs, styles et matériaux
- **Produits similaires** : Trouvez des produits VIVR correspondant à l'image analysée

## Installation

### Mode développeur (Chrome)

1. Ouvrez Chrome et accédez à `chrome://extensions/`
2. Activez le **Mode développeur** (en haut à droite)
3. Cliquez sur **Charger l'extension non empaquetée**
4. Sélectionnez le dossier `chrome-extension-visual-search`
5. L'extension est installée !

### Utilisation

1. **Via clic droit** : Sur n'importe quelle page web, faites un clic droit sur une image et sélectionnez "VIVR - Trouver des produits similaires"

2. **Via le popup** : Cliquez sur l'icône de l'extension et :
   - Glissez-déposez une image
   - Ou collez une URL d'image
   - Cliquez sur "Trouver des produits similaires"

## Configuration requise

- Le site VIVR doit être en cours d'exécution sur `http://localhost:3000`
- Une clé API OpenAI doit être configurée dans le fichier `.env` du projet VIVR

## Structure

```
chrome-extension-visual-search/
├── manifest.json      # Configuration de l'extension
├── background.js      # Service worker (gestion du menu contextuel)
├── popup.html         # Interface du popup
├── popup.js           # Logique du popup
├── styles.css         # Styles du popup
└── icons/             # Icônes de l'extension
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## Technologies utilisées

- Chrome Extensions Manifest V3
- OpenAI GPT-4 Vision API (via le backend VIVR)
- JavaScript vanilla

## Notes

Cette extension fonctionne en tandem avec le site VIVR. L'analyse d'image est effectuée par l'API `/api/vision/analyze` du site.
