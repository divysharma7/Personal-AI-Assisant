import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from 'react'

function joinClasses(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ')
}

interface WorkspacePageProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function WorkspacePage({ children, className, ...props }: WorkspacePageProps) {
  return <div className={joinClasses('workspace-page', className)} {...props}>{children}</div>
}

interface WorkspaceHeaderProps extends HTMLAttributes<HTMLElement> {
  title: string
  subtitle?: string
  icon?: ReactNode
  actions?: ReactNode
}

export function WorkspaceHeader({ title, subtitle, icon, actions, className, ...props }: WorkspaceHeaderProps) {
  return (
    <header className={joinClasses('workspace-header', className)} {...props}>
      <div className="flex min-w-0 items-center gap-2.5">
        {icon ? <span className="shrink-0 text-[var(--text-muted)]" aria-hidden="true">{icon}</span> : null}
        <div className="min-w-0">
          <h1 className="type-page-title truncate text-[var(--text-primary)]">{title}</h1>
          {subtitle ? <p className="type-micro truncate text-[var(--text-muted)]">{subtitle}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </header>
  )
}

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  raised?: boolean
}

export function Surface({ children, raised = false, className, ...props }: SurfaceProps) {
  return <div className={joinClasses(raised ? 'surface-raised' : 'surface-card', className)} {...props}>{children}</div>
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

export function IconButton({ label, className, type = 'button', children, ...props }: IconButtonProps) {
  return (
    <button type={type} aria-label={label} className={joinClasses('control-icon', className)} {...props}>
      {children}
    </button>
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
}

export function Button({ variant = 'ghost', className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={joinClasses(variant === 'primary' ? 'btn-primary' : 'btn-ghost', className)} {...props} />
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={joinClasses('input-field', className)} {...props} />
}

interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  label?: string
}

export function Popover({ children, className, label, role = 'menu', ...props }: PopoverProps) {
  return <div role={role} aria-label={label} className={joinClasses('popover-shell', className)} {...props}>{children}</div>
}

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  label: string
  onDismiss?: () => void
}

export function Modal({ children, className, label, onDismiss, ...props }: ModalProps) {
  return (
    <div
      className="modal-scrim"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onDismiss?.()
      }}
    >
      <div role="dialog" aria-modal="true" aria-label={label} className={joinClasses('modal-shell', className)} {...props}>
        {children}
      </div>
    </div>
  )
}
