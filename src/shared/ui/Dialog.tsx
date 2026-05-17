'use client'
import { ReactNode } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { scaleIn, modalTransition } from '@/shared/design-system'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  title?: string
  description?: string
  className?: string
}

export function Dialog({
  open,
  onOpenChange,
  children,
  title,
  description,
  className,
}: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                style={{ background: 'rgba(0,0,0,0.5)' }}
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild>
              <motion.div
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={modalTransition}
                className={cn(
                  'fixed z-50 top-1/2 left-1/2',
                  'w-full max-w-md max-h-[88vh]',
                  'flex flex-col overflow-hidden',
                  'rounded-2xl outline-none',
                  className,
                )}
                style={{
                  transform: 'translate(-50%, -50%)',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                }}
              >
                {/* Header */}
                {(title || description) && (
                  <div className="flex items-start justify-between px-6 pt-5 pb-3">
                    <div>
                      {title && (
                        <DialogPrimitive.Title
                          className="text-base font-semibold"
                          style={{ color: 'var(--text-1)' }}
                        >
                          {title}
                        </DialogPrimitive.Title>
                      )}
                      {description && (
                        <DialogPrimitive.Description
                          className="text-sm mt-1"
                          style={{ color: 'var(--text-2)' }}
                        >
                          {description}
                        </DialogPrimitive.Description>
                      )}
                    </div>
                    <DialogPrimitive.Close
                      className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--text-3)' }}
                    >
                      <X size={16} />
                    </DialogPrimitive.Close>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                  {children}
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}
