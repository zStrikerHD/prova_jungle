import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { disconnectSocket } from '@/lib/socket/client'
import type { UserProfile } from '@/types'

export type AuthMode = 'login' | 'register'
export type { UserProfile }
interface RegisterData { username: string; email: string; password?: string }
interface Result { success: boolean; error?: string }
interface AuthContextType {
  isAuthModalOpen: boolean; authMode: AuthMode; isAuthenticated: boolean; isSessionLoading: boolean; user: UserProfile | null
  openAuthModal: (mode?: AuthMode) => void; closeAuthModal: () => void; setAuthMode: (mode: AuthMode) => void
  login: (email: string, password?: string, provider?: string) => Promise<Result>
  register: (data: RegisterData) => Promise<Result>
  updateProfile: (data: Partial<UserProfile>) => Promise<Result>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const messageFrom = (error: unknown) => (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Não foi possível concluir a operação.'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isSessionLoading, setSessionLoading] = useState(() => !!localStorage.getItem('auth_token'))

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) return
    apiClient.get<{ user: UserProfile }>('/auth/session')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('auth_token'))
      .finally(() => setSessionLoading(false))
  }, [])
  useEffect(() => {
    const expired = () => {
      setUser(null); disconnectSocket(); queryClient.clear()
      if (window.location.pathname !== '/login') {
        sessionStorage.setItem('kurio_return_to', `${window.location.pathname}${window.location.search}`)
        window.location.assign('/login')
      }
    }
    window.addEventListener('kurio:session-expired', expired)
    return () => window.removeEventListener('kurio:session-expired', expired)
  }, [queryClient])

  const persistSession = (data: { token: string; user: UserProfile }) => {
    if (user && user.id !== data.user.id) { disconnectSocket(); queryClient.clear() }
    localStorage.setItem('auth_token', data.token); setUser(data.user); setIsAuthModalOpen(false)
  }
  const login = async (email: string, password = '', provider?: string): Promise<Result> => {
    try { const { data } = await apiClient.post('/auth/login', { email, password, provider }); persistSession(data); return { success: true } }
    catch (error) { return { success: false, error: messageFrom(error) } }
  }
  const register = async ({ username, email, password = '' }: RegisterData): Promise<Result> => {
    try { const { data } = await apiClient.post('/auth/register', { username, email, password }); persistSession(data); return { success: true } }
    catch (error) { return { success: false, error: messageFrom(error) } }
  }
  const updateProfile = async (updates: Partial<UserProfile>): Promise<Result> => {
    try { const { data } = await apiClient.patch<UserProfile>('/profile', updates); setUser(data); return { success: true } }
    catch (error) { return { success: false, error: messageFrom(error) } }
  }
  const logout = async () => {
    try { await apiClient.post('/auth/logout') } finally {
      localStorage.removeItem('auth_token'); setUser(null); disconnectSocket(); queryClient.clear()
    }
  }
  return <AuthContext.Provider value={{ isAuthModalOpen, authMode, openAuthModal: (mode = 'login') => { setAuthMode(mode); setIsAuthModalOpen(true) }, closeAuthModal: () => setIsAuthModalOpen(false), setAuthMode, isAuthenticated: !!user, isSessionLoading, user, login, register, updateProfile, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth deve ser usado dentro de AuthProvider'); return value }
