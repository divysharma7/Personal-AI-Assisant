'use client'
import { ReactNode } from 'react'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { Sheet } from './Sheet'
import { Dialog } from './Dialog'

interface ResponsiveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  title?: string
  description?: string
  className?: string
}

export function ResponsiveModal({
  open,
  onOpenChange,
  children,
  title,
  description,
  className,
}: ResponsiveModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  if (isMobile) {
    return (
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        className={className}
      >
        {children}
      </Sheet>
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      className={className}
    >
      {children}
    </Dialog>
  )
}
