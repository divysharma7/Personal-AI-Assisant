import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

export default class ChunkErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a chunk load error
    if (error.name === 'ChunkLoadError' || error.message?.includes('Failed to fetch dynamically imported module')) {
      return { hasError: true }
    }
    throw error // Re-throw non-chunk errors
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: 32,
          gap: 16,
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>
            New version available
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            The app has been updated. Please reload to get the latest version.
          </p>
          <button
            onClick={() => window.location.reload()}
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
            Reload
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
