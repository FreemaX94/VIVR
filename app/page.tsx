'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Truck, Shield, RefreshCw, HeadphonesIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Product, Category } from '@/types'

// Mock data for development (will be replaced with API calls)
const mockCategories: Category[] = [
  { id: '1', name: 'Salon', slug: 'salon', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80' },
  { id: '2', name: 'Chambre', slug: 'chambre', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80' },
  { id: '3', name: 'Cuisine', slug: 'cuisine', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80' },
  { id: '4', name: 'Bureau', slug: 'bureau', image: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=600&q=80' },
]

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Lampe de table Nordique',
    slug: 'lampe-table-nordique',
    description: 'Lampe design scandinave en bois naturel',
    price: 89.99,
    comparePrice: 129.99,
    images: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&q=80'],
    category: mockCategories[0],
    categoryId: '1',
    stock: 15,
    featured: true,
    reviews: [],
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Vase céramique minimal',
    slug: 'vase-ceramique-minimal',
    description: 'Vase artisanal en céramique blanche',
    price: 45.00,
    images: ['https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&q=80'],
    category: mockCategories[0],
    categoryId: '1',
    stock: 25,
    featured: true,
    reviews: [],
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Coussin lin naturel',
    slug: 'coussin-lin-naturel',
    description: 'Coussin en lin lavé, toucher doux',
    price: 35.00,
    images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80'],
    category: mockCategories[1],
    categoryId: '2',
    stock: 50,
    featured: false,
    reviews: [],
    createdAt: new Date(),
  },
  {
    id: '4',
    name: 'Miroir rond doré',
    slug: 'miroir-rond-dore',
    description: 'Miroir mural avec cadre doré élégant',
    price: 159.00,
    comparePrice: 199.00,
    images: ['https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80'],
    category: mockCategories[1],
    categoryId: '2',
    stock: 8,
    featured: true,
    reviews: [],
    createdAt: new Date(),
  },
]

const features = [
  {
    icon: Truck,
    title: 'Livraison gratuite',
    description: 'Dès 50€ d\'achat en France',
  },
  {
    icon: RefreshCw,
    title: 'Retours gratuits',
    description: '30 jours pour changer d\'avis',
  },
  {
    icon: Shield,
    title: 'Paiement sécurisé',
    description: 'Vos données protégées',
  },
  {
    icon: HeadphonesIcon,
    title: 'Service client',
    description: 'À votre écoute 7j/7',
  },
]

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(mockProducts)
  const [categories, setCategories] = useState<Category[]>(mockCategories)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=80"
            alt="Interior design"
            fill
            priority
            unoptimized
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-gray-900">Vivez votre</span>
              <br />
              <span className="text-gray-600">intérieur</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-md">
              Découvrez notre collection de décoration intérieure minimaliste et élégante.
              Transformez votre espace de vie.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/produits">
                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Découvrir la collection
                </Button>
              </Link>
              <Link href="/nouveautes">
                <Button variant="secondary" size="lg">
                  Nouveautés
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-bg-secondary mb-4">
                  <feature.icon className="h-6 w-6 text-text-primary" />
                </div>
                <h3 className="font-semibold text-text-primary">{feature.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-text-primary">
                Nos catégories
              </h2>
              <p className="mt-2 text-text-secondary">
                Explorez nos univers déco
              </p>
            </div>
            <Link
              href="/categories"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-text-primary hover:text-accent transition-colors"
            >
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  href={`/categories/${category.slug}`}
                  className="group relative block aspect-[4/5] rounded-2xl overflow-hidden"
                >
                  <Image
                    src={category.image || '/images/placeholder.jpg'}
                    alt={category.name}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-semibold text-white">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-white/70 text-sm">
                      Découvrir
                      <ArrowRight className="inline-block ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-24 bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-text-primary">
                Produits vedettes
              </h2>
              <p className="mt-2 text-text-secondary">
                Notre sélection du moment
              </p>
            </div>
            <Link
              href="/produits"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-text-primary hover:text-accent transition-colors"
            >
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <ProductGrid products={featuredProducts} columns={4} />

          <div className="mt-10 text-center sm:hidden">
            <Link href="/produits">
              <Button variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Voir tous les produits
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1616046229478-9f8e0a7bfe1d?w=1920&q=80"
                alt="Interior inspiration"
                fill
                unoptimized
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
            <div className="relative py-24 px-8 lg:px-16 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl lg:text-5xl font-bold text-white max-w-2xl mx-auto">
                  Créez l'intérieur de vos rêves
                </h2>
                <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
                  Profitez de -15% sur votre première commande avec le code BIENVENUE15
                </p>
                <div className="mt-8">
                  <Link href="/produits">
                    <Button
                      size="lg"
                      className="bg-white text-black hover:bg-white/90"
                    >
                      J'en profite
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Feed Placeholder */}
      <section className="py-16 lg:py-24 bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary">
              @vivr.deco
            </h2>
            <p className="mt-2 text-text-secondary">
              Rejoignez notre communauté sur Instagram
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              'photo-1618221195710-dd6b41faaea6',
              'photo-1555041469-a586c61ea9bc',
              'photo-1556909114-f6e7ad7d3136',
              'photo-1522771739844-6a9f6d5f14af',
              'photo-1593062096033-9a26b09da705',
              'photo-1513506003901-1e6a229e2d15',
            ].map((photoId, index) => (
              <motion.a
                key={photoId}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative aspect-square rounded-xl overflow-hidden bg-bg-secondary"
              >
                <Image
                  src={`https://images.unsplash.com/${photoId}?w=400&q=80`}
                  alt="Instagram post"
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
