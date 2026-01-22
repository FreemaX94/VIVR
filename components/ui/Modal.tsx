'use client'

import { ReactNode, useEffect, useRef, useCallback, useId } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[90vw] max-h-[90vh]',
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descriptionId = useId()

  // Focus trap
  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (!modalRef.current || e.key !== 'Tab') return

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault()
      lastElement?.focus()
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault()
      firstElement?.focus()
    }
  }, [])

  // Handle escape key and focus management
  useEffect(() => {
    if (!isOpen) return

    // Store currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement

    // Focus the modal
    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusableElements?.[0]?.focus()

    // Escape key handler
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden'

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', trapFocus)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', trapFocus)

      // Restore focus
      previousActiveElement.current?.focus()
    }
  }, [isOpen, onClose, trapFocus])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="presentation"
      >
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descriptionId : undefined}
          className={cn(
            'w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-modal-in',
            sizeClasses[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between px-6 py-4 border-b border-border-light">
              <div>
                {title && (
                  <h2
                    id={titleId}
                    className="text-lg font-semibold text-text-primary"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id={descriptionId}
                    className="mt-1 text-sm text-text-secondary"
                  >
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 -m-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-bg-secondary"
                  aria-label="Fermer la modale"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

interface ModalBodyProps {
  children: ReactNode
  className?: string
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  )
}

interface ModalFooterProps {
  children: ReactNode
  className?: string
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn('px-6 py-4 bg-bg-secondary/50 flex items-center justify-end gap-3', className)}>
      {children}
    </div>
  )
}
