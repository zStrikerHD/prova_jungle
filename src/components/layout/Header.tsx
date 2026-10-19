import { Link, useRouterState } from '@tanstack/react-router'
import { Search, ShoppingCart, LogIn, User as UserIcon } from 'lucide-react'
import { useCart } from '@/features/cart'
import { useAuth } from '@/features/auth'

export function Header() {
  const { itemCount } = useCart()
  const { isAuthenticated, user, openAuthModal, logout } = useAuth()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const isMercado =
    pathname.startsWith('/mercado') ||
    pathname === '/cart' ||
    pathname === '/pagamento' ||
    pathname === '/checkout'
  const isInicio = !isMercado && (pathname === '/' || pathname === '')

  return (
    <header className="hidden md:block sticky top-0 z-50 w-full border-b border-[#2A201A]/60 bg-[#140D0A] px-4 sm:px-6 lg:px-[120px] py-3.5 sm:py-4">
      <div className="w-full flex items-center justify-between">
        
        {/* 1. Logo (KURIO) */}
        <Link to="/" className="font-mono text-xl font-bold tracking-widest text-white hover:opacity-90">
          KURIO
        </Link>

        {/* 2. Links de Navegação */}
        <nav className="hidden md:flex items-center gap-10 font-mono text-sm">
          {/* Início */}
          <div className="relative flex flex-col items-center">
            <Link
              to="/"
              className={isInicio ? 'text-[#D97938] font-bold' : 'text-[#998F86] hover:text-white transition-colors'}
            >
              Início
            </Link>
            {isInicio && (
              <span className="absolute -bottom-2 h-[2px] w-full bg-[#D97938] rounded-full" />
            )}
          </div>

          {/* Mercado */}
          <div className="relative flex flex-col items-center">
            <Link
              to="/mercado/nft/$id"
              params={{ id: '1' }}
              className={isMercado ? 'text-[#D97938] font-bold' : 'text-[#998F86] hover:text-white transition-colors'}
            >
              Mercado
            </Link>
            {isMercado && (
              <span className="absolute -bottom-2 h-[2px] w-full bg-[#D97938] rounded-full" />
            )}
          </div>

          <a href="#criadores" className="text-[#998F86] hover:text-white transition-colors">
            Criadores
          </a>
          <a href="#aprenda" className="text-[#998F86] hover:text-white transition-colors">
            Aprenda
          </a>
        </nav>

        {/* 3. Ações da Direita (Busca, Carrinho e Botão Entrar) */}
        <div className="flex items-center gap-6">
          {/* Busca */}
          <button
            type="button"
            aria-label="Buscar"
            className="text-white hover:text-[#D97938] transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Carrinho com Badge Dinâmico */}
          <Link
            to="/cart"
            aria-label="Carrinho de compras"
            className="relative text-white hover:text-[#D97938] transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#D97938] text-[10px] font-bold text-[#140E0A] animate-in zoom-in-50">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Botão Entrar / Perfil Autenticado */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3 font-mono">
              <Link
                to="/perfil"
                className="text-xs text-[#D97938] hover:text-[#E58847] flex items-center gap-2 font-medium transition-colors group"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="h-6 w-6 rounded-full object-cover border border-[#D97938]/60 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <UserIcon className="h-4 w-4" />
                )}
                <span>{user?.displayName || user?.username}</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-[#2A201A] px-3 py-1.5 text-xs text-[#998F86] hover:text-white hover:border-[#D97938] transition-all cursor-pointer"
              >
                Sair
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-2 rounded-lg bg-[#D97938] px-4 py-2 text-sm font-semibold text-[#140E0A] shadow-md hover:bg-[#E58847] active:scale-95 transition-all cursor-pointer"
            >
              <LogIn className="h-4 w-4 stroke-[2.5]" />
              <span>Entrar</span>
            </button>
          )}
        </div>

      </div>
    </header>
  )
}
