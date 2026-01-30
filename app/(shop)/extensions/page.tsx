'use client'

import {
  Chrome,
  Download,
  Camera,
  ShoppingBag,
  Sparkles,
  MousePointerClick,
  ArrowRight,
  CheckCircle2,
  Star
} from 'lucide-react'

const extensions = [
  {
    id: 'product-importer',
    name: 'VIVR Product Importer',
    version: '1.1.0',
    description:
      'Importez des produits depuis n\'importe quel site e-commerce et analysez des images pour trouver des produits similaires dans notre catalogue.',
    icon: ShoppingBag,
    color: 'from-blue-500 to-indigo-600',
    textColor: 'text-blue-600',
    features: [
      'Import automatique des produits depuis tout site web',
      'Extraction du nom, prix, images et description',
      'Analyse d\'images par IA pour trouver des similaires',
      'Menu contextuel pour analyser toute image',
      'Connexion directe à votre compte VIVR',
    ],
    folder: 'chrome-extension',
  },
  {
    id: 'visual-search',
    name: 'VIVR Visual Search',
    version: '1.0.0',
    description:
      'Analysez n\'importe quelle image sur le web pour trouver des produits de décoration similaires sur VIVR. Clic droit sur une image et c\'est parti !',
    icon: Camera,
    color: 'from-purple-500 to-fuchsia-600',
    textColor: 'text-purple-600',
    features: [
      'Recherche visuelle par clic droit sur toute image',
      'Analyse IA des styles, couleurs et matériaux',
      'Suggestions de produits similaires VIVR',
      'Interface popup intuitive et rapide',
      'Fonctionne sur tous les sites web',
    ],
    folder: 'chrome-extension-visual-search',
  },
]

const installSteps = [
  {
    step: 1,
    title: 'Téléchargez',
    description: 'Cliquez sur le bouton de téléchargement de l\'extension souhaitée',
    icon: Download,
  },
  {
    step: 2,
    title: 'Décompressez',
    description: 'Extrayez le fichier ZIP dans un dossier de votre choix',
    icon: ArrowRight,
  },
  {
    step: 3,
    title: 'Ouvrez Chrome',
    description: 'Allez dans chrome://extensions et activez le mode développeur',
    icon: Chrome,
  },
  {
    step: 4,
    title: 'Installez',
    description: 'Cliquez sur "Charger l\'extension non empaquetée" et sélectionnez le dossier',
    icon: MousePointerClick,
  },
]

export default function ExtensionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white">
        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Chrome className="h-5 w-5" />
              <span className="text-sm font-medium">Extensions Chrome</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nos extensions navigateur
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Enrichissez votre expérience VIVR avec nos extensions Chrome.
              Importez des produits et recherchez par image directement depuis votre navigateur.
            </p>
          </div>
        </div>
      </section>

      {/* Extensions Cards */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-10 pb-16">
        <div className="grid md:grid-cols-2 gap-8">
          {extensions.map((ext) => (
            <div
              key={ext.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${ext.color} p-6 text-white`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                      <ext.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{ext.name}</h2>
                      <span className="text-sm text-white/70">v{ext.version}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <p className="text-gray-600 mb-6">{ext.description}</p>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Fonctionnalités
                  </h3>
                  {ext.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className={`h-5 w-5 ${ext.textColor} shrink-0 mt-0.5`} />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Download Button */}
                <a
                  href={`/extensions/${ext.folder}.zip`}
                  download
                  className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${ext.color} text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity`}
                >
                  <Download className="h-5 w-5" />
                  Télécharger l&apos;extension
                </a>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Chrome &bull; Manifest V3 &bull; Gratuit
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Installation Steps */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Comment installer ?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Installation simple en 4 étapes — aucune connaissance technique requise
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {installSteps.map((step) => (
              <div
                key={step.step}
                className="relative bg-gray-50 rounded-xl p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mb-4">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="absolute top-3 right-4 text-5xl font-bold text-gray-100">
                  {step.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <Sparkles className="h-10 w-10 mx-auto mb-4 text-yellow-300" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Une question ? Un retour ?
          </h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            Nos extensions sont en développement actif. N&apos;hésitez pas à nous faire part de vos suggestions pour les améliorer.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-emerald-600 font-semibold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Nous contacter
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>
    </div>
  )
}
