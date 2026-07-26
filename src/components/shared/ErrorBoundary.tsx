import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  reset() {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          padding: 32,
          gap: 16,
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 400 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => this.reset()}
              style={{
                padding: '8px 24px',
                borderRadius: 8,
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Try again
            </button>
            <button
              onClick={() => { window.location.href = '/' }}
              style={{
                padding: '8px 24px',
                borderRadius: 8,
                background: 'var(--bg-pane-2)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Go home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
