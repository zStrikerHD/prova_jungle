import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/query/client'
import { CartProvider } from '@/features/cart'
import { AuthProvider } from '@/features/auth'
import { RealtimeProvider } from './RealtimeProvider'

interface ProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RealtimeProvider>
          <CartProvider>{children}</CartProvider>
        </RealtimeProvider>
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
