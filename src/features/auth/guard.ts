import { redirect } from '@tanstack/react-router'
import { apiClient } from '@/lib/api/client'

export async function requireAuth(location: { href: string }) {
  try { await apiClient.get('/auth/session') }
  catch {
    sessionStorage.setItem('kurio_return_to', location.href)
    throw redirect({ to: '/login' })
  }
}
