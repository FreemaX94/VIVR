# VIVR Product Importer - Extension Chrome

Extension Chrome permettant d'importer facilement des produits de n'importe quel site e-commerce vers votre boutique VIVR.

## Fonctionnalites

- Extraction automatique des informations produit (titre, description, prix, images)
- Support des sites majeurs : Amazon, eBay, AliExpress, Cdiscount, Fnac, etc.
- Extraction generique pour tout autre site e-commerce
- Edition des informations avant import
- Selection de la categorie de destination
- Transfert direct vers votre boutique VIVR

## Installation

### 1. Generer les icones

1. Ouvrez le fichier `icons/generate-icons.html` dans votre navigateur
2. Cliquez sur chaque bouton "Telecharger" pour sauvegarder les icones
3. Placez les fichiers dans le dossier `icons/`

### 2. Charger l'extension dans Chrome

1. Ouvrez Chrome et allez dans `chrome://extensions/`
2. Activez le "Mode developpeur" (en haut a droite)
3. Cliquez sur "Charger l'extension non empaquetee"
4. Selectionnez le dossier `chrome-extension`

### 3. Configurer l'extension

1. Cliquez sur l'icone de l'extension dans la barre d'outils
2. Cliquez sur l'icone des parametres (engrenage)
3. Entrez l'URL de votre site VIVR (ex: `http://localhost:3000`)
4. Entrez votre cle API : `vivr-extension-key-2024` (par defaut)
5. Cliquez sur "Sauvegarder"

## Utilisation

1. Naviguez vers un produit sur n'importe quel site e-commerce
2. Cliquez sur l'icone VIVR dans la barre d'outils
3. Les informations du produit sont automatiquement extraites
4. Modifiez le titre, la description, le prix selon vos besoins
5. Selectionnez la categorie de destination
6. Cliquez sur "Transferer vers VIVR"

## Configuration API

Par defaut, l'extension utilise la cle API `vivr-extension-key-2024`.

Pour personnaliser cette cle, ajoutez dans votre fichier `.env` :

```
EXTENSION_API_KEY=votre-cle-secrete
```

## Structure des fichiers

```
chrome-extension/
├── manifest.json       # Configuration de l'extension
├── popup.html          # Interface utilisateur
├── popup.js            # Logique du popup
├── content.js          # Script d'extraction (injecte dans les pages)
├── background.js       # Service worker
├── styles.css          # Styles de l'interface
├── icons/              # Icones de l'extension
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   ├── icon128.png
│   └── generate-icons.html  # Generateur d'icones
└── README.md           # Cette documentation
```

## Sites supportes

L'extension detecte automatiquement le type de site et utilise l'extracteur adapte :

| Site | Extraction |
|------|------------|
| Amazon | Optimisee |
| eBay | Optimisee |
| AliExpress | Optimisee |
| Cdiscount | Optimisee |
| Fnac | Optimisee |
| Autres sites | Generique |

## Developpement

### Tester l'API

```bash
curl -X POST http://localhost:3000/api/extension/products \
  -H "Content-Type: application/json" \
  -H "X-Extension-Key: vivr-extension-key-2024" \
  -d '{
    "name": "Produit Test",
    "description": "Description du produit test",
    "price": 29.99,
    "categoryId": "ID_DE_LA_CATEGORIE",
    "images": ["https://example.com/image.jpg"]
  }'
```

### Debug

- Ouvrez `chrome://extensions/`
- Cliquez sur "Inspecter les vues" > "Service Worker" pour voir les logs du background
- Clic droit sur le popup > "Inspecter" pour debug le popup
- F12 sur la page web pour voir les logs du content script

## Securite

- La cle API est stockee localement dans Chrome Storage
- Les requetes sont envoyees uniquement vers l'URL configuree
- Aucune donnee n'est envoyee a des serveurs tiers

## Licence

Propriete de VIVR. Usage interne uniquement.
