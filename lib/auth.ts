import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from './prisma'
import { validateNextAuthSecret } from './auth-security'

// P1-1: Validate NEXTAUTH_SECRET on module load
validateNextAuthSecret()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error('Identifiants incorrects')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Identifiants incorrects')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    // P2-8: Configure session timeout (7 days instead of default 30 days)
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  // P1-3: Enable JWT secret rotation support
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/connexion',
    signOut: '/connexion',
    error: '/connexion',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
}

// Type augmentation for session
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: string
    }
  }
  interface User {
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role?: string
  }
}
