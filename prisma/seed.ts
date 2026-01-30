import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.wishlist.deleteMany()
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.newsletter.deleteMany()

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Salon',
        slug: 'salon',
        description: 'Meubles et accessoires pour votre salon',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Chambre',
        slug: 'chambre',
        description: 'Tout pour une chambre cozy et élégante',
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Cuisine',
        slug: 'cuisine',
        description: 'Accessoires et déco pour votre cuisine',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Bureau',
        slug: 'bureau',
        description: 'Organisez votre espace de travail',
        image: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=600&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Salle de bain',
        slug: 'salle-de-bain',
        description: 'Accessoires pour votre salle de bain',
        image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Extérieur',
        slug: 'exterieur',
        description: 'Déco et mobilier d\'extérieur',
        image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80',
      },
    }),
  ])

  const [salon, chambre, cuisine, bureau, salleDeBain, exterieur] = categories

  console.log(`✅ ${categories.length} catégories créées`)

  // Create products
  const products = await Promise.all([
    // SALON
    prisma.product.create({
      data: {
        name: 'Lampe de table Nordique',
        slug: 'lampe-table-nordique',
        description: 'Lampe design scandinave en bois naturel et abat-jour en lin. Éclairage doux et chaleureux pour votre intérieur.',
        price: 89.99,
        comparePrice: 129.99,
        images: JSON.stringify(['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&q=80']),
        categoryId: salon.id,
        stock: 15,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Vase céramique minimal',
        slug: 'vase-ceramique-minimal',
        description: 'Vase artisanal en céramique blanche au design épuré. Parfait pour des fleurs séchées ou comme objet décoratif.',
        price: 45.00,
        images: JSON.stringify(['https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&q=80']),
        categoryId: salon.id,
        stock: 25,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Canapé 3 places Oslo',
        slug: 'canape-3-places-oslo',
        description: 'Canapé 3 places au design scandinave avec pieds en bois massif. Tissu doux et confortable, parfait pour votre salon.',
        price: 599.00,
        comparePrice: 799.00,
        images: JSON.stringify(['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80']),
        categoryId: salon.id,
        stock: 5,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Table basse en chêne',
        slug: 'table-basse-chene',
        description: 'Table basse rectangulaire en chêne massif avec finition naturelle. Design minimaliste et intemporel.',
        price: 249.00,
        images: JSON.stringify(['https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600&q=80']),
        categoryId: salon.id,
        stock: 10,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Tapis berbère ivoire',
        slug: 'tapis-berbere-ivoire',
        description: 'Tapis berbère tissé main en laine naturelle. Motifs géométriques traditionnels sur fond ivoire.',
        price: 189.00,
        comparePrice: 239.00,
        images: JSON.stringify(['https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80']),
        categoryId: salon.id,
        stock: 8,
        featured: false,
      },
    }),

    // CHAMBRE
    prisma.product.create({
      data: {
        name: 'Coussin lin naturel',
        slug: 'coussin-lin-naturel',
        description: 'Coussin en lin lavé au toucher doux et naturel. Coloris beige, parfait pour une ambiance cosy.',
        price: 35.00,
        images: JSON.stringify(['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80']),
        categoryId: chambre.id,
        stock: 50,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Miroir rond doré',
        slug: 'miroir-rond-dore',
        description: 'Miroir mural rond avec cadre en métal doré. Diamètre 60cm, idéal pour agrandir visuellement votre pièce.',
        price: 159.00,
        comparePrice: 199.00,
        images: JSON.stringify(['https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80']),
        categoryId: chambre.id,
        stock: 8,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Lampe de chevet Murano',
        slug: 'lampe-chevet-murano',
        description: 'Lampe de chevet en verre soufflé style Murano. Lumière tamisée et ambiance chaleureuse garantie.',
        price: 75.00,
        images: JSON.stringify(['https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&q=80']),
        categoryId: chambre.id,
        stock: 20,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Parure de lit en coton bio',
        slug: 'parure-lit-coton-bio',
        description: 'Parure de lit 240x220cm en coton biologique certifié. Douceur incomparable et teintes naturelles.',
        price: 119.00,
        comparePrice: 149.00,
        images: JSON.stringify(['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80']),
        categoryId: chambre.id,
        stock: 30,
        featured: true,
      },
    }),

    // CUISINE
    prisma.product.create({
      data: {
        name: 'Set de planches à découper',
        slug: 'set-planches-decouper',
        description: 'Lot de 3 planches à découper en bois d\'acacia. Différentes tailles pour tous vos besoins en cuisine.',
        price: 49.00,
        images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80']),
        categoryId: cuisine.id,
        stock: 40,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Bocaux en verre (lot de 4)',
        slug: 'bocaux-verre-lot-4',
        description: 'Lot de 4 bocaux en verre avec couvercle en bambou. Parfaits pour ranger pâtes, riz, céréales.',
        price: 32.00,
        images: JSON.stringify(['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80']),
        categoryId: cuisine.id,
        stock: 35,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Suspension cuisine industrielle',
        slug: 'suspension-cuisine-industrielle',
        description: 'Suspension en métal noir style industriel. Parfaite au-dessus d\'un îlot ou d\'une table de cuisine.',
        price: 89.00,
        comparePrice: 119.00,
        images: JSON.stringify(['https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=600&q=80']),
        categoryId: cuisine.id,
        stock: 12,
        featured: true,
      },
    }),

    // BUREAU
    prisma.product.create({
      data: {
        name: 'Lampe de bureau articulée',
        slug: 'lampe-bureau-articulee',
        description: 'Lampe de bureau LED articulée en aluminium brossé. Intensité réglable et design moderne.',
        price: 69.00,
        images: JSON.stringify(['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80']),
        categoryId: bureau.id,
        stock: 20,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Organiseur de bureau en bois',
        slug: 'organiseur-bureau-bois',
        description: 'Organiseur de bureau multi-compartiments en bois de noyer. Rangement stylos, cartes et accessoires.',
        price: 42.00,
        images: JSON.stringify(['https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=600&q=80']),
        categoryId: bureau.id,
        stock: 25,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Fauteuil de bureau ergonomique',
        slug: 'fauteuil-bureau-ergonomique',
        description: 'Fauteuil de bureau ergonomique avec accoudoirs réglables et support lombaire. Tissu respirant.',
        price: 329.00,
        comparePrice: 429.00,
        images: JSON.stringify(['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80']),
        categoryId: bureau.id,
        stock: 7,
        featured: true,
      },
    }),

    // SALLE DE BAIN
    prisma.product.create({
      data: {
        name: 'Miroir salle de bain LED',
        slug: 'miroir-salle-bain-led',
        description: 'Miroir rectangulaire avec éclairage LED intégré et système anti-buée. 80x60cm.',
        price: 179.00,
        comparePrice: 229.00,
        images: JSON.stringify(['https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80']),
        categoryId: salleDeBain.id,
        stock: 10,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Set accessoires bambou',
        slug: 'set-accessoires-bambou',
        description: 'Set de 4 accessoires de salle de bain en bambou : distributeur savon, gobelet, porte-brosse, plateau.',
        price: 38.00,
        images: JSON.stringify(['https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80']),
        categoryId: salleDeBain.id,
        stock: 30,
        featured: false,
      },
    }),

    // EXTÉRIEUR
    prisma.product.create({
      data: {
        name: 'Lanterne solaire décorative',
        slug: 'lanterne-solaire-decorative',
        description: 'Lanterne solaire en métal ajouré avec LED blanc chaud. S\'allume automatiquement à la tombée de la nuit.',
        price: 29.00,
        images: JSON.stringify(['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80']),
        categoryId: exterieur.id,
        stock: 45,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Salon de jardin résine tressée',
        slug: 'salon-jardin-resine',
        description: 'Salon de jardin 4 places en résine tressée avec coussins gris. Résistant aux intempéries.',
        price: 449.00,
        comparePrice: 599.00,
        images: JSON.stringify(['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80']),
        categoryId: exterieur.id,
        stock: 3,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Pot de fleur XXL terracotta',
        slug: 'pot-fleur-xxl-terracotta',
        description: 'Grand pot de fleur en terracotta fait main. Diamètre 45cm, idéal pour plantes d\'extérieur.',
        price: 55.00,
        images: JSON.stringify(['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80']),
        categoryId: exterieur.id,
        stock: 18,
        featured: false,
      },
    }),
  ])

  console.log(`✅ ${products.length} produits créés`)

  // Create some reviews
  // First create a test user
  const user = await prisma.user.upsert({
    where: { email: 'admin@vivr.fr' },
    update: {},
    create: {
      email: 'admin@vivr.fr',
      name: 'Admin VIVR',
      role: 'ADMIN',
      password: '$2a$10$placeholder', // Not a real hash, just for seed
    },
  })

  console.log(`✅ Utilisateur admin créé: ${user.email}`)

  // Add some reviews to featured products
  const reviewData = [
    { productSlug: 'lampe-table-nordique', rating: 5, title: 'Magnifique !', comment: 'Design superbe et lumière très agréable.' },
    { productSlug: 'lampe-table-nordique', rating: 4, title: 'Très bien', comment: 'Belle lampe, bon rapport qualité-prix.' },
    { productSlug: 'vase-ceramique-minimal', rating: 5, title: 'Parfait', comment: 'Exactement ce que je cherchais, très élégant.' },
    { productSlug: 'canape-3-places-oslo', rating: 5, title: 'Confort incroyable', comment: 'Très confortable et livraison impeccable.' },
    { productSlug: 'miroir-rond-dore', rating: 4, title: 'Joli miroir', comment: 'Bon produit, la dorure est très belle.' },
    { productSlug: 'parure-lit-coton-bio', rating: 5, title: 'Qualité top', comment: 'Coton très doux, je recommande vivement.' },
  ]

  // Create a second user for reviews (so we don't hit unique constraint)
  const reviewer = await prisma.user.upsert({
    where: { email: 'marie@test.fr' },
    update: {},
    create: {
      email: 'marie@test.fr',
      name: 'Marie D.',
      role: 'USER',
      password: '$2a$10$placeholder',
    },
  })

  for (const review of reviewData) {
    const product = products.find(p => p.slug === review.productSlug)
    if (product) {
      await prisma.review.create({
        data: {
          userId: reviewer.id,
          productId: product.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          verified: true,
        },
      }).catch(() => {
        // Skip if duplicate (userId + productId unique constraint)
      })
    }
  }

  console.log(`✅ Avis créés`)
  console.log('🎉 Seed terminé avec succès !')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
