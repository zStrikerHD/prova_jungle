import { useState, useEffect, useRef, type FormEvent } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'
import { useAuth } from '../context'

export function AuthModal() {
  const router = useRouter()
  const { isAuthModalOpen, authMode, closeAuthModal, setAuthMode, login, register } = useAuth()
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Register form state
  const [registerUsername, setRegisterUsername] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('')
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)

  // Fechar no ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAuthModalOpen, closeAuthModal])

  useEffect(() => {
    if (!isAuthModalOpen) return
    const previous = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href]') || []).filter((element) => element.offsetParent !== null)
    queueMicrotask(() => focusable()[0]?.focus())
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const elements = focusable(); if (!elements.length) return
      const first = elements[0]; const last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', trapFocus)
    return () => { document.removeEventListener('keydown', trapFocus); previous?.focus() }
  }, [isAuthModalOpen])

  if (!isAuthModalOpen) return null

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError('')
    const result = await login(loginEmail, loginPassword)
    if (!result.success) { setAuthError(result.error || 'Não foi possível entrar.'); return }
    const returnTo = sessionStorage.getItem('kurio_return_to')
    if (returnTo) { sessionStorage.removeItem('kurio_return_to'); window.location.assign(returnTo) } else router.navigate({ to: '/perfil' })
  }

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError('')

    if (registerPassword && registerConfirmPassword && registerPassword !== registerConfirmPassword) {
      setAuthError('As senhas não coincidem.')
      return
    }

    const res = await register({
      username: registerUsername || 'colecionador_novo',
      email: registerEmail || 'novo@email.com',
      password: registerPassword,
    })

    if (!res.success) {
      setAuthError(res.error || 'Erro ao criar conta.')
      return
    }

    router.navigate({ to: '/perfil' })
  }

  const handleSocial = async (provider: string, email: string) => {
    const result = await login(email, '', provider)
    if (!result.success) { setAuthError(result.error || 'Não foi possível entrar.'); return }
    router.navigate({ to: '/perfil' })
  }

  return (
    <div ref={dialogRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 md:backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200 overflow-y-auto" role="dialog" aria-modal="true" aria-label={authMode === 'login' ? 'Entrar' : 'Criar conta'}>
      {/* Backdrop click to close on desktop */}
      <div
        className="hidden md:block absolute inset-0"
        onClick={closeAuthModal}
        aria-hidden="true"
      />

      {/* ========================================================
          MOBILE VIEW: Exato do Figma (Mobile / Login - 358 Fill × 832 Fill)
         ======================================================== */}
      <div className="block md:hidden relative z-10 w-full min-h-screen bg-[#140D0A] px-4 py-8 flex flex-col justify-center items-center font-mono">
        {/* Botão Fechar no topo direito */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-[#8A7E75] hover:text-white transition-colors cursor-pointer p-2"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="w-full max-w-[358px] flex flex-col space-y-5">
          {/* 1. Bloco Topo: KURIO (358 Fill × 136) */}
          <div className="h-[136px] flex items-center justify-center">
            <span className="text-3xl font-bold tracking-[0.25em] text-white">
              KURIO
            </span>
          </div>

          {/* 2. Bloco Título: Entrar ou Criar perfil de colecionador */}
          <div className="text-center">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
              {authMode === 'login' ? 'Entrar' : 'Criar perfil de colecionador'}
            </h1>
          </div>

          {authError && (
            <div role="alert" className="rounded-lg bg-red-950/40 border border-red-500/40 p-2 text-center text-xs text-red-300">
              {authError}
            </div>
          )}

          {/* 3. Bloco Formulário (358 Fill × 140 Hug / 358 Fill × 236 Hug) */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 pt-2">
              {/* Campo E-mail */}
              <div className="rounded-[14px] border border-[#2E1E17] bg-[#1C110C] px-4 py-3.5 focus-within:border-[#C87C45] transition-colors">
                <input
                  type="email"
                  aria-label="E-mail"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="contato@email.com"
                  className="w-full bg-transparent text-xs text-[#FAF4EE] placeholder-[#C49A6C] outline-none font-mono"
                />
              </div>

              {/* Campo Senha com Borda Âmbar em destaque e Ícone Olho */}
              <div className="rounded-[14px] border border-[#D47E45] bg-[#1C110C] px-4 py-3.5 flex items-center justify-between transition-colors">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  aria-label="Senha"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="************"
                  className="w-full bg-transparent text-xs text-[#FAF4EE] placeholder-[#C49A6C] outline-none font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="text-[#C49A6C] hover:text-white transition-colors ml-2 cursor-pointer"
                  aria-label={showLoginPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showLoginPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Link Esqueceu a senha? */}
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  className="text-xs text-[#D97938] hover:text-[#E58847] hover:underline transition-all cursor-pointer font-mono"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* 4. Botão Entrar (358 × 60) */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-[60px] rounded-[18px] bg-[#C87C45] hover:bg-[#D97938] active:scale-[0.99] text-[#140D0A] font-bold text-sm tracking-wide transition-all shadow-lg cursor-pointer flex items-center justify-center"
                >
                  Entrar
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 pt-1">
              {/* Campo 1: Nome de usuário (Centralizado conforme Figma) */}
              <div className="rounded-[14px] border border-[#2E1E17] bg-[#1C110C] px-4 py-3.5 focus-within:border-[#C87C45] transition-colors">
                <input
                  type="text"
                  aria-label="Nome de usuário"
                  required
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  placeholder="Nome de usuário"
                  className="w-full bg-transparent text-xs text-[#FAF4EE] placeholder-[#C49A6C] outline-none font-mono text-center"
                />
              </div>

              {/* Campo 2: Digite seu e-mail */}
              <div className="rounded-[14px] border border-[#2E1E17] bg-[#1C110C] px-4 py-3.5 focus-within:border-[#C87C45] transition-colors">
                <input
                  type="email"
                  aria-label="E-mail"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  className="w-full bg-transparent text-xs text-[#FAF4EE] placeholder-[#C49A6C] outline-none font-mono"
                />
              </div>

              {/* Campo 3: Senha */}
              <div className="rounded-[14px] border border-[#2E1E17] bg-[#1C110C] px-4 py-3.5 flex items-center justify-between focus-within:border-[#C87C45] transition-colors">
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  aria-label="Senha"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Senha"
                  className="w-full bg-transparent text-xs text-[#FAF4EE] placeholder-[#C49A6C] outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="text-[#C49A6C] hover:text-white transition-colors ml-2 cursor-pointer"
                  aria-label={showRegisterPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showRegisterPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>

              {/* Campo 4: Confirmar senha */}
              <div className="rounded-[14px] border border-[#2E1E17] bg-[#1C110C] px-4 py-3.5 flex items-center justify-between focus-within:border-[#C87C45] transition-colors">
                <input
                  type={showRegisterConfirmPassword ? 'text' : 'password'}
                  aria-label="Confirmar senha"
                  required
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  placeholder="Confirmar senha"
                  className="w-full bg-transparent text-xs text-[#FAF4EE] placeholder-[#C49A6C] outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                  className="text-[#C49A6C] hover:text-white transition-colors ml-2 cursor-pointer"
                  aria-label={showRegisterConfirmPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showRegisterConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>

              {/* 4. Botão Criar perfil (358 Fill × 60) */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-[60px] rounded-[18px] bg-[#C87C45] hover:bg-[#D97938] active:scale-[0.99] text-[#140D0A] font-bold text-sm tracking-wide transition-all shadow-lg cursor-pointer flex items-center justify-center"
                >
                  Criar perfil
                </button>
              </div>
            </form>
          )}

          {/* 5. Seção Social (358 Fill × 124 Hug) */}
          <div className="space-y-3 pt-3">
            <div className="relative flex items-center justify-center my-2">
              <div className="h-[1px] bg-[#2E1E17] flex-1" />
              <span className="px-3 text-xs text-[#C49A6C] font-mono">
                Ou continue com
              </span>
              <div className="h-[1px] bg-[#2E1E17] flex-1" />
            </div>

            <button
              type="button"
              onClick={() => handleSocial('google', 'google.user@gmail.com')}
              className="w-full h-[48px] rounded-[14px] border border-[#2E1E17] bg-[#1A110D] hover:bg-[#251812] active:scale-98 flex items-center justify-center gap-3 text-xs text-[#FAF4EE] transition-all cursor-pointer font-mono shadow-sm"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continuar com Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocial('facebook', 'facebook.user@fb.com')}
              className="w-full h-[48px] rounded-[14px] border border-[#2E1E17] bg-[#1A110D] hover:bg-[#251812] active:scale-98 flex items-center justify-center gap-3 text-xs text-[#FAF4EE] transition-all cursor-pointer font-mono shadow-sm"
            >
              <svg className="w-4 h-4 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Continuar com Facebook</span>
            </button>
          </div>

          {/* 6. Rodapé Link (358 Fill × 20 Hug) */}
          <div className="pt-4 text-center">
            {authMode === 'login' ? (
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="text-xs text-[#FAF4EE] hover:text-[#D97938] transition-colors cursor-pointer font-mono"
              >
                Novo na Kurio? <span className="text-[#C49A6C] hover:text-[#D97938]">Crie uma conta</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-xs text-[#FAF4EE] hover:text-[#D97938] transition-colors cursor-pointer font-mono"
              >
                Já tem uma conta? <span className="text-[#C49A6C] hover:text-[#D97938]">Entre</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          DESKTOP VIEW: Modal Original (Desktop / Login & Cadastro)
         ======================================================== */}
      <div className="hidden md:block relative z-10 w-full max-w-[500px] rounded-[8px] bg-[#241612] border border-[#38261E] shadow-2xl overflow-hidden font-mono animate-in zoom-in-95 duration-200">
        {/* Botão Fechar */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-[#8A7E75] hover:text-white transition-colors cursor-pointer"
          aria-label="Fechar modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-8 sm:px-12 pt-7 pb-8">
          {/* Header / Tabs */}
          <div className="flex items-center justify-center gap-2 text-base font-bold tracking-wider">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`transition-colors cursor-pointer ${
                authMode === 'login'
                  ? 'text-[#D97938]'
                  : 'text-[#C4BCB4] hover:text-white'
              }`}
            >
              Entrar
            </button>
            <span className="text-[#5A473C]">|</span>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`transition-colors cursor-pointer ${
                authMode === 'register'
                  ? 'text-[#D97938]'
                  : 'text-[#C4BCB4] hover:text-white'
              }`}
            >
              Criar conta
            </button>
          </div>

          {/* Subtítulo dinâmico conforme Figma */}
          <p className="mt-2.5 mb-6 text-center text-xs text-[#998F86] leading-relaxed max-w-[360px] mx-auto">
            {authMode === 'login'
              ? 'Entre para gerenciar sua carteira, coleção e perfil de criador.'
              : 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.'}
          </p>

          {authError && (
            <div role="alert" className="mb-4 rounded-lg bg-red-950/40 border border-red-500/40 p-2.5 text-center text-xs text-red-300">
              {authError}
            </div>
          )}

          {/* Formulário: Login (Entrar) */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {/* Campo E-mail */}
              <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="contato@email.com"
                  className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
                />
              </div>

              {/* Campo Senha */}
              <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 flex items-center justify-between focus-within:border-[#D97938] transition-colors">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="************"
                  className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="text-[#8A7E75] hover:text-[#C4BCB4] transition-colors ml-2 cursor-pointer"
                  aria-label={showLoginPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showLoginPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Esqueceu a senha? */}
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  className="text-[11px] text-[#D97938] hover:underline transition-all cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Botão Entrar */}
              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full rounded-[8px] bg-[#D97938] hover:bg-[#E58847] active:scale-[0.99] py-3 text-xs font-bold text-[#140D0A] uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Entrar
                </button>
              </div>
            </form>
          )}

          {/* Formulário: Cadastro (Criar conta) */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              {/* Campo 1: Nome de usuário */}
              <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
                <input
                  type="text"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  placeholder="Nome de usuário"
                  className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
                />
              </div>

              {/* Campo 2: Digite seu e-mail */}
              <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
                />
              </div>

              {/* Campo 3: Senha */}
              <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 flex items-center justify-between focus-within:border-[#D97938] transition-colors">
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Senha"
                  className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="text-[#8A7E75] hover:text-[#C4BCB4] transition-colors ml-2 cursor-pointer"
                  aria-label={showRegisterPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showRegisterPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Campo 4: Confirmar senha */}
              <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  placeholder="Confirmar senha"
                  className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
                />
              </div>

              {/* Botão Criar conta */}
              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full rounded-[8px] bg-[#D97938] hover:bg-[#E58847] active:scale-[0.99] py-3 text-xs font-bold text-[#140D0A] uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Criar conta
                </button>
              </div>
            </form>
          )}

          {/* Divisor "Ou continue com" */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#38261E]" />
            </div>
            <span className="relative bg-[#241612] px-3 text-[11px] text-[#8A7E75]">
              Ou continue com
            </span>
          </div>

          {/* Botões Sociais */}
          <div className="space-y-2.5">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocial('google', 'google.user@gmail.com')}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-[8px] border border-[#38261E] bg-[#170E0B]/60 hover:bg-[#170E0B] text-xs text-[#EAE5E0] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar com Google</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleSocial('facebook', 'facebook.user@fb.com')}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-[8px] border border-[#38261E] bg-[#170E0B]/60 hover:bg-[#170E0B] text-xs text-[#EAE5E0] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Continuar com Facebook</span>
            </button>
          </div>
        </div>

        {/* Linha de borda laranja na parte inferior (conforme Figma) */}
        <div className="h-[3px] w-full bg-[#D97938]" />
      </div>
    </div>
  )
}
