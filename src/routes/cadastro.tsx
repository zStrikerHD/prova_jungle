import { useState, type FormEvent } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/features/auth'

export const Route = createFileRoute('/cadastro')({
  component: CadastroPage,
})

function CadastroPage() {
  const navigate = useNavigate()
  const { register, login } = useAuth()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password && confirmPassword && password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    const res = await register({
      username,
      email,
      password,
    })

    if (!res.success) {
      setError(res.error || 'Erro ao criar conta.')
      return
    }

    navigate({ to: '/perfil' })
  }

  const handleSocialLogin = async (socialEmail: string) => {
    const result = await login(socialEmail, '', 'social')
    if (!result.success) { setError(result.error || 'Não foi possível entrar.'); return }
    navigate({ to: '/perfil' })
  }

  return (
    <div className="min-h-screen w-full bg-[#140D0A] flex flex-col justify-center items-center py-6 px-4 font-mono select-none">
      <div className="w-full max-w-[358px] flex flex-col gap-4">
        
        {/* 1. Bloco Topo: KURIO (358 Fill × 136) */}
        <div className="h-[136px] flex items-center justify-center">
          <Link to="/" className="text-3xl font-bold tracking-[0.25em] text-white hover:opacity-90 transition-opacity">
            KURIO
          </Link>
        </div>

        {/* 2. Bloco Título: Criar perfil de colecionador (358 Fill × 16 Hug) */}
        <div className="h-[16px] flex items-center justify-center">
          <h1 className="text-base font-bold text-white tracking-wide leading-[16px]">
            Criar perfil de colecionador
          </h1>
        </div>

        {error && (
          <div role="alert" className="rounded-lg bg-red-950/40 border border-red-500/40 p-2 text-center text-xs text-red-300">
            {error}
          </div>
        )}

        {/* 3. Bloco Formulário (358 Fill × 236 Hug) = 4 x 50px inputs + 3 x 12px gap */}
        <form id="cadastro-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Campo 1: Nome de usuário (Centralizado conforme Figma) */}
          <div className="h-[50px] rounded-[14px] border border-[#2E1E17] bg-[#1C110C] px-4 flex items-center focus-within:border-[#C87C45] transition-colors">
            <input
              type="text"
              aria-label="Nome de usuário"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nome de usuário"
              className="w-full bg-transparent text-xs text-[#FAF4EE] placeholder-[#C49A6C] outline-none font-mono text-center"
            />
          </div>

          {/* Campo 2: Digite seu e-mail */}
          <div className="h-[50px] rounded-[14px] border border-[#2E1E17] bg-[#1C110C] px-4 flex items-center focus-within:border-[#C87C45] transition-colors">
            <input
              type="email"
              aria-label="E-mail"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              className="w-full bg-transparent text-xs text-[#FAF4EE] placeholder-[#C49A6C] outline-none font-mono"
            />
          </div>

          {/* Campo 3: Senha */}
          <div className="h-[50px] rounded-[14px] border border-[#2E1E17] bg-[#1C110C] px-4 flex items-center justify-between focus-within:border-[#C87C45] transition-colors">
            <input
              type={showPassword ? 'text' : 'password'}
              aria-label="Senha"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full bg-transparent text-xs text-[#FAF4EE] placeholder-[#C49A6C] outline-none font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#C49A6C] hover:text-white transition-colors ml-2 cursor-pointer shrink-0"
              aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
            >
              {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>

          {/* Campo 4: Confirmar senha */}
          <div className="h-[50px] rounded-[14px] border border-[#2E1E17] bg-[#1C110C] px-4 flex items-center justify-between focus-within:border-[#C87C45] transition-colors">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              aria-label="Confirmar senha"
              autoComplete="new-password"
              minLength={8}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar senha"
              className="w-full bg-transparent text-xs text-[#FAF4EE] placeholder-[#C49A6C] outline-none font-mono"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-[#C49A6C] hover:text-white transition-colors ml-2 cursor-pointer shrink-0"
              aria-label={showConfirmPassword ? 'Ocultar senha' : 'Exibir senha'}
            >
              {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
        </form>

        {/* 4. Botão Criar perfil (358 Fill × 60) */}
        <div>
          <button
            type="submit"
            form="cadastro-form"
            className="w-full h-[60px] rounded-[18px] bg-[#C87C45] hover:bg-[#D97938] active:scale-[0.99] text-[#140D0A] font-bold text-sm tracking-wide transition-all shadow-lg cursor-pointer flex items-center justify-center font-mono"
          >
            Criar perfil
          </button>
        </div>

        {/* 5. Seção Social (358 Fill × 124 Hug) = 16px divider + 10px gap + 44px Google + 10px gap + 44px FB */}
        <div className="flex flex-col gap-2.5">
          {/* Divisor "Ou continue com" */}
          <div className="h-[16px] flex items-center justify-center">
            <div className="h-[1px] bg-[#2E1E17] flex-1" />
            <span className="px-3 text-xs text-[#C49A6C] font-mono leading-[16px]">
              Ou continue com
            </span>
            <div className="h-[1px] bg-[#2E1E17] flex-1" />
          </div>

          {/* Botão Google */}
          <button
            type="button"
            onClick={() => handleSocialLogin('google.user@gmail.com')}
            className="w-full h-[44px] rounded-[14px] border border-[#2E1E17] bg-[#1A110D] hover:bg-[#251812] active:scale-98 flex items-center justify-center gap-3 text-xs text-[#FAF4EE] transition-all cursor-pointer font-mono shadow-sm"
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

          {/* Botão Facebook */}
          <button
            type="button"
            onClick={() => handleSocialLogin('facebook.user@fb.com')}
            className="w-full h-[44px] rounded-[14px] border border-[#2E1E17] bg-[#1A110D] hover:bg-[#251812] active:scale-98 flex items-center justify-center gap-3 text-xs text-[#FAF4EE] transition-all cursor-pointer font-mono shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Continuar com Facebook</span>
          </button>
        </div>

        {/* 6. Rodapé Link (358 Fill × 20 Hug) */}
        <div className="h-[20px] flex items-center justify-center">
          <Link
            to="/login"
            className="text-xs text-[#FAF4EE] hover:text-[#D97938] transition-colors cursor-pointer font-mono leading-[20px]"
          >
            Já tem uma conta? <span className="text-[#C49A6C] hover:text-[#D97938]">Entre</span>
          </Link>
        </div>

      </div>
    </div>
  )
}
