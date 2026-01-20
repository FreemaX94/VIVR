'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  Edit2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    id: 'profile',
    label: 'Mon profil',
    icon: User,
    href: '/compte',
    description: 'Gérer vos informations personnelles',
  },
  {
    id: 'orders',
    label: 'Mes commandes',
    icon: Package,
    href: '/compte/commandes',
    description: 'Suivre vos commandes et retours',
    badge: '2',
  },
  {
    id: 'wishlist',
    label: 'Ma liste de souhaits',
    icon: Heart,
    href: '/wishlist',
    description: 'Vos articles favoris',
  },
  {
    id: 'addresses',
    label: 'Mes adresses',
    icon: MapPin,
    href: '/compte/adresses',
    description: 'Gérer vos adresses de livraison',
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    href: '/compte/parametres',
    description: 'Préférences et notifications',
  },
]

// Mock recent orders
const recentOrders = [
  {
    id: '1',
    orderNumber: 'VIV-2024-001',
    date: '15 janvier 2024',
    total: 189.99,
    status: 'delivered',
    items: 3,
  },
  {
    id: '2',
    orderNumber: 'VIV-2024-002',
    date: '20 janvier 2024',
    total: 79.00,
    status: 'shipped',
    items: 1,
  },
]

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'default' }> = {
  pending: { label: 'En attente', variant: 'warning' },
  processing: { label: 'En préparation', variant: 'warning' },
  shipped: { label: 'Expédiée', variant: 'default' },
  delivered: { label: 'Livrée', variant: 'success' },
}

export default function AccountPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeSection, setActiveSection] = useState('profile')

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!session) {
    router.push('/connexion')
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
            Mon compte
          </h1>
          <p className="mt-1 text-text-secondary">
            Bienvenue, {session.user.name || session.user.email}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={handleSignOut}
          leftIcon={<LogOut className="h-4 w-4" />}
        >
          Se déconnecter
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <nav className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-border-light p-4 sticky top-24">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-xl transition-colors',
                      activeSection === item.id
                        ? 'bg-black text-white'
                        : 'text-text-primary hover:bg-bg-secondary'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <Badge
                        variant={activeSection === item.id ? 'secondary' : 'primary'}
                        size="sm"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Profile Card */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-border-light p-6"
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">
                Informations personnelles
              </h2>
              <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-4 w-4" />}>
                Modifier
              </Button>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-bg-secondary flex items-center justify-center">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || ''}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-semibold text-text-primary">
                    {(session.user.name || session.user.email || '?')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-text-primary text-lg">
                  {session.user.name || 'Utilisateur'}
                </h3>
                <p className="text-text-secondary">{session.user.email}</p>
                <p className="text-sm text-text-muted mt-1">
                  Membre depuis janvier 2024
                </p>
              </div>
            </div>
          </motion.section>

          {/* Recent Orders */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-border-light p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">
                Commandes récentes
              </h2>
              <Link
                href="/compte/commandes"
                className="text-sm text-text-secondary hover:text-accent transition-colors flex items-center gap-1"
              >
                Voir tout
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-text-muted mb-4" />
                <p className="text-text-secondary">Aucune commande pour le moment</p>
                <Link href="/produits">
                  <Button variant="secondary" className="mt-4">
                    Découvrir nos produits
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/compte/commandes/${order.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary hover:bg-border-light transition-colors"
                  >
                    <div>
                      <p className="font-medium text-text-primary">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-text-muted">
                        {order.date} • {order.items} article{order.items > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text-primary">
                        {order.total.toFixed(2)} €
                      </p>
                      <Badge variant={statusLabels[order.status].variant} size="sm">
                        {statusLabels[order.status].label}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.section>

          {/* Quick Actions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            <Link
              href="/wishlist"
              className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-border-light hover:border-accent transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center">
                <Heart className="h-6 w-6 text-text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Liste de souhaits</h3>
                <p className="text-sm text-text-muted">Voir vos favoris</p>
              </div>
            </Link>

            <Link
              href="/compte/adresses"
              className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-border-light hover:border-accent transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center">
                <MapPin className="h-6 w-6 text-text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Mes adresses</h3>
                <p className="text-sm text-text-muted">Gérer vos adresses</p>
              </div>
            </Link>
          </motion.section>
        </div>
      </div>
    </div>
  )
}
