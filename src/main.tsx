import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { App } from './App'
import './index.css'

// Validate env vars at startup — throws if VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing
import '@/lib/env'

// DevTools only in development — excluded from production bundle
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({
        default: m.ReactQueryDevtools,
      }))
    )
  : null

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found — check index.html')

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster position="top-right" richColors closeButton duration={4000} />
      {ReactQueryDevtools && (
        <Suspense>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  </StrictMode>
)
