import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import Providers from '@/app/providers'
import { router } from '@/router/router'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
import ChunkErrorBoundary from '@/components/shared/ChunkErrorBoundary'
import '@/app/globals.css'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root mount element')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ChunkErrorBoundary>
      <ErrorBoundary>
        <Providers>
          <RouterProvider router={router} />
        </Providers>
      </ErrorBoundary>
    </ChunkErrorBoundary>
  </React.StrictMode>,
)
