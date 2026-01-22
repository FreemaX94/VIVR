'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToastStore } from '@/stores/toastStore'

// The legendary Konami Code
const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a'
]

// Secret word sequences
const SECRET_WORDS = {
  'vivr': { action: 'discount', message: 'Psst... vous avez trouve un code secret!' },
  'design': { action: 'designMode', message: 'Mode designer active!' },
  'party': { action: 'party', message: 'C est la fete!' },
  'matrix': { action: 'matrix', message: 'Bienvenue dans la Matrice...' },
}

interface EasterEggState {
  konamiActivated: boolean
  designModeActive: boolean
  partyModeActive: boolean
  matrixModeActive: boolean
  secretDiscount: string | null
  discoveredEggs: string[]
}

export function useEasterEggs() {
  const router = useRouter()
  const addToast = useToastStore((state) => state.addToast)

  const [state, setState] = useState<EasterEggState>({
    konamiActivated: false,
    designModeActive: false,
    partyModeActive: false,
    matrixModeActive: false,
    secretDiscount: null,
    discoveredEggs: [],
  })

  const [konamiIndex, setKonamiIndex] = useState(0)
  const [typedKeys, setTypedKeys] = useState('')

  // Konami Code Detection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check Konami Code
      if (event.key === KONAMI_CODE[konamiIndex]) {
        const nextIndex = konamiIndex + 1
        setKonamiIndex(nextIndex)

        if (nextIndex === KONAMI_CODE.length) {
          // Konami Code completed!
          activateKonamiMode()
          setKonamiIndex(0)
        }
      } else {
        setKonamiIndex(0)
      }

      // Check for typed secret words (only letters)
      if (/^[a-zA-Z]$/.test(event.key)) {
        const newTyped = (typedKeys + event.key.toLowerCase()).slice(-10)
        setTypedKeys(newTyped)

        // Check against secret words
        Object.entries(SECRET_WORDS).forEach(([word, config]) => {
          if (newTyped.endsWith(word)) {
            activateSecretWord(word, config)
            setTypedKeys('')
          }
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [konamiIndex, typedKeys])

  const activateKonamiMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      konamiActivated: true,
      discoveredEggs: [...new Set([...prev.discoveredEggs, 'konami'])]
    }))

    // Save to localStorage
    const eggs = JSON.parse(localStorage.getItem('vivr-easter-eggs') || '[]')
    if (!eggs.includes('konami')) {
      localStorage.setItem('vivr-easter-eggs', JSON.stringify([...eggs, 'konami']))
    }

    // Trigger confetti and redirect to secret page
    addToast({
      type: 'success',
      message: 'Code Konami active! Bienvenue dans le club secret VIVR.',
    })

    // Navigate to secret page after a brief delay
    setTimeout(() => {
      router.push('/secret')
    }, 1500)
  }, [addToast, router])

  const activateSecretWord = useCallback((word: string, config: { action: string; message: string }) => {
    setState(prev => ({
      ...prev,
      discoveredEggs: [...new Set([...prev.discoveredEggs, word])]
    }))

    switch (config.action) {
      case 'discount':
        const discountCode = `VIVR-SECRET-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        setState(prev => ({ ...prev, secretDiscount: discountCode }))
        addToast({
          type: 'success',
          message: `${config.message} Code: ${discountCode}`,
        })
        break
      case 'designMode':
        setState(prev => ({ ...prev, designModeActive: !prev.designModeActive }))
        document.body.classList.toggle('design-mode')
        addToast({ type: 'info', message: config.message })
        break
      case 'party':
        setState(prev => ({ ...prev, partyModeActive: true }))
        triggerPartyMode()
        addToast({ type: 'success', message: config.message })
        setTimeout(() => {
          setState(prev => ({ ...prev, partyModeActive: false }))
          document.body.classList.remove('party-mode')
        }, 5000)
        break
      case 'matrix':
        setState(prev => ({ ...prev, matrixModeActive: !prev.matrixModeActive }))
        document.body.classList.toggle('matrix-mode')
        addToast({ type: 'info', message: config.message })
        break
    }
  }, [addToast])

  const triggerPartyMode = () => {
    document.body.classList.add('party-mode')
    // Could trigger confetti here
  }

  // Check if user has previously discovered eggs
  useEffect(() => {
    const savedEggs = JSON.parse(localStorage.getItem('vivr-easter-eggs') || '[]')
    if (savedEggs.length > 0) {
      setState(prev => ({
        ...prev,
        discoveredEggs: savedEggs
      }))
    }
  }, [])

  return {
    ...state,
    totalEggsFound: state.discoveredEggs.length,
    totalEggs: Object.keys(SECRET_WORDS).length + 1, // +1 for Konami
  }
}

// Logo click counter for secret activation
export function useLogoClickEgg(threshold = 7) {
  const [clickCount, setClickCount] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)
  const router = useRouter()
  const addToast = useToastStore((state) => state.addToast)

  const handleLogoClick = useCallback(() => {
    const now = Date.now()

    // Reset if more than 2 seconds between clicks
    if (now - lastClickTime > 2000) {
      setClickCount(1)
    } else {
      setClickCount(prev => prev + 1)
    }

    setLastClickTime(now)

    if (clickCount + 1 >= threshold) {
      addToast({
        type: 'success',
        message: 'Vous avez trouve le passage secret!',
      })
      router.push('/secret/atelier')
      setClickCount(0)
    }
  }, [clickCount, lastClickTime, threshold, addToast, router])

  return { handleLogoClick, clickCount }
}
