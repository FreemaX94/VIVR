'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const passwordRequirements = [
  { id: 'length', label: '8 caractères minimum', test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'Une majuscule', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'Une minuscule', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'Un chiffre', test: (p: string) => /\d/.test(p) },
]

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  const passwordStrength = passwordRequirements.filter((req) => req.test(password)).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    if (passwordStrength < 4) {
      setError('Le mot de passe ne respecte pas tous les critères')
      setIsLoading(false)
      return
    }

    if (!acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Erreur lors de la création du compte')
        return
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Compte créé, mais erreur de connexion')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920)',
          }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">
            Rejoignez VIVR
          </h2>
          <p className="text-lg text-white/80">
            Créez votre compte et profitez d'avantages exclusifs.
          </p>
          <ul className="mt-6 space-y-3">
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-success" />
              <span>-10% sur votre première commande</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-success" />
              <span>Accès aux ventes privées</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-success" />
              <span>Suivi de vos commandes</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-success" />
              <span>Liste de souhaits personnalisée</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <span className="text-3xl font-bold">VIVR</span>
            </Link>
            <h1 className="text-2xl font-bold text-text-primary">
              Créer un compte
            </h1>
            <p className="mt-2 text-text-secondary">
              Rejoignez la communauté VIVR
            </p>
          </div>

          {/* Google Sign Up */}
          <Button
            variant="secondary"
            fullWidth
            onClick={handleGoogleSignIn}
            className="mb-6"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuer avec Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-light" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-text-muted">ou</span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error">
                {error}
              </div>
            )}

            <Input
              type="text"
              label="Nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jean Dupont"
              required
              leftIcon={<User className="h-4 w-4" />}
            />

            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              leftIcon={<Mail className="h-4 w-4" />}
            />

            <div>
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-text-muted hover:text-text-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />

              {/* Password Strength */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordStrength >= level
                            ? passwordStrength === 4
                              ? 'bg-success'
                              : passwordStrength >= 3
                                ? 'bg-warning'
                                : 'bg-error'
                            : 'bg-border-light'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {passwordRequirements.map((req) => (
                      <div
                        key={req.id}
                        className={`flex items-center gap-1.5 text-xs ${
                          req.test(password) ? 'text-success' : 'text-text-muted'
                        }`}
                      >
                        <Check className="h-3 w-3" />
                        {req.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Input
              type="password"
              label="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              leftIcon={<Lock className="h-4 w-4" />}
              error={
                confirmPassword && password !== confirmPassword
                  ? 'Les mots de passe ne correspondent pas'
                  : undefined
              }
            />

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border-medium text-accent focus:ring-accent"
              />
              <span className="text-sm text-text-secondary">
                J'accepte les{' '}
                <Link href="/cgv" className="text-accent hover:underline">
                  conditions générales
                </Link>{' '}
                et la{' '}
                <Link href="/confidentialite" className="text-accent hover:underline">
                  politique de confidentialité
                </Link>
              </span>
            </label>

            <Button type="submit" fullWidth isLoading={isLoading}>
              Créer mon compte
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Déjà un compte ?{' '}
            <Link
              href="/connexion"
              className="font-medium text-accent hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
