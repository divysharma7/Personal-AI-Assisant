'use client'
import { Drawer } from 'vaul'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  title?: string
  description?: string
  snapPoints?: (string | number)[]
  className?: string
}

export function Sheet({
  open,
  onOpenChange,
  children,
  title,
  description,
  snapPoints,
  className,
}: SheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} snapPoints={snapPoints}>
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        />
        <Drawer.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50',
            'rounded-t-2xl',
            'max-h-[96vh] flex flex-col',
            'outline-none',
            className,
          )}
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderBottom: 'none',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div
              className="h-1.5 w-12 rounded-full"
              style={{ background: 'var(--border-hover)' }}
            />
          </div>

          {title && (
            <Drawer.Title
              className="px-6 pt-1 pb-1 text-base font-semibold"
              style={{ color: 'var(--text-1)' }}
            >
              {title}
            </Drawer.Title>
          )}
          {description && (
            <Drawer.Description
              className="px-6 pb-2 text-sm"
              style={{ color: 'var(--text-2)' }}
            >
              {description}
            </Drawer.Description>
          )}

          <div className="flex-1 overflow-y-auto px-6 pb-8">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
