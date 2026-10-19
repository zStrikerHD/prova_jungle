import { Link, useRouterState } from '@tanstack/react-router'
import { Home, Heart, ShoppingCart, User } from 'lucide-react'
import { useAuth } from '@/features/auth'

export function MobileBottomNav() {
  const { isAuthenticated, openAuthModal } = useAuth()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const isHome = pathname === '/'
  const isProfile = pathname.startsWith('/perfil') || pathname.startsWith('/carteiras')
  const isCart = pathname === '/cart'

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pointer-events-none select-none">
      <div className="relative mx-auto max-w-md w-full h-[76px] pointer-events-auto">
        
        {/* Fundo SVG com recorte côncavo suave contínuo (conforme Screenshot 4 do Figma) */}
        <svg
          className="absolute inset-0 w-full h-full drop-shadow-[0_-8px_20px_rgba(0,0,0,0.5)]"
          preserveAspectRatio="none"
          viewBox="0 0 390 76"
          fill="none"
        >
          <path
            d="M 0 24
               Q 0 0 24 0
               L 142 0
               C 158 0, 166 46, 195 46
               C 224 46, 232 0, 248 0
               L 366 0
               Q 390 0 390 24
               L 390 76
               L 0 76
               Z"
            fill="#1E1410"
          />
        </svg>

        {/* Botão Central Flutuante com Halo Âmbar e Ícone de Cápsula Exato */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-3.5 flex items-center justify-center">
          <Link
            to="/mercado/nft/$id"
            params={{ id: '1' }}
            aria-label="Explorar Mercado"
            className="group relative flex h-[58px] w-[58px] items-center justify-center rounded-full transition-transform active:scale-95"
          >
            {/* Halo externo translúcido quente conforme Figma */}
            <div className="absolute inset-0 rounded-full bg-[#C87C45]/30 pointer-events-none blur-[1px]" />
            
            {/* Círculo principal âmbar/caramelo */}
            <div className="relative flex h-[50px] w-[50px] items-center justify-center rounded-full bg-gradient-to-b from-[#C87C45] via-[#BA6F3A] to-[#995526] shadow-lg shadow-[#C87C45]/40 border border-[#E5A87B]/30">
              {/* Ícone de Cápsula / Scan exato do Figma (arco superior, traço horizontal central, arco inferior) */}
              <svg
                className="h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M 6.5 8.5 C 6.5 4, 17.5 4, 17.5 8.5" />
                <line x1="4.5" y1="12" x2="19.5" y2="12" />
                <path d="M 6.5 15.5 C 6.5 20, 17.5 20, 17.5 15.5" />
              </svg>
            </div>
          </Link>
        </div>

        {/* 4 Ícones de Navegação com cores e preenchimento sólido conforme Figma Screenshot 4 */}
        <div className="relative z-10 flex h-full items-center justify-between px-7 pt-2">
          
          {/* Lado Esquerdo: Home + Favoritos */}
          <div className="flex items-center gap-9">
            {/* 1. Início (Ativo: Laranja preenchido) */}
            <Link
              to="/"
              className="p-2 transition-transform active:scale-90"
              aria-label="Início"
            >
              <Home
                className={`h-5 w-5 ${
                  isHome ? 'fill-[#E59560] text-[#E59560]' : 'fill-[#F0D7C2] text-[#F0D7C2]'
                }`}
              />
            </Link>

            {/* 2. Favoritos (Coração sólido preenchido em creme) */}
            <Link
              to="/perfil"
              className="p-2 transition-transform active:scale-90"
              aria-label="Favoritos"
            >
              <Heart className="h-5 w-5 fill-[#F0D7C2] text-[#F0D7C2]" />
            </Link>
          </div>

          {/* Lado Direito: Carrinho + Perfil */}
          <div className="flex items-center gap-9">
            {/* 3. Carrinho (Carrinho sólido preenchido em creme) */}
            <Link
              to="/cart"
              className="p-2 transition-transform active:scale-90"
              aria-label="Carrinho"
            >
              <ShoppingCart
                className={`h-5 w-5 ${
                  isCart ? 'fill-[#E59560] text-[#E59560]' : 'fill-[#F0D7C2] text-[#F0D7C2]'
                }`}
              />
            </Link>

            {/* 4. Perfil / Login (Avatar sólido preenchido em creme) */}
            {isAuthenticated ? (
              <Link
                to="/perfil"
                className="p-2 transition-transform active:scale-90"
                aria-label="Perfil"
              >
                <User
                  className={`h-5 w-5 ${
                    isProfile ? 'fill-[#E59560] text-[#E59560]' : 'fill-[#F0D7C2] text-[#F0D7C2]'
                  }`}
                />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="p-2 transition-transform active:scale-90 cursor-pointer"
                aria-label="Entrar"
              >
                <User
                  className={`h-5 w-5 ${
                    isProfile ? 'fill-[#E59560] text-[#E59560]' : 'fill-[#F0D7C2] text-[#F0D7C2]'
                  }`}
                />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
