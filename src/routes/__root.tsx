import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { Header, Footer, MobileBottomNav } from '@/components/layout'
import { AuthModal } from '@/features/auth'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isStandaloneMobile =
    pathname.startsWith('/mercado/nft/') ||
    pathname === '/pagamento' ||
    pathname === '/checkout' ||
    pathname === '/login' ||
    pathname === '/cadastro'

  return (
    <div className="min-h-screen bg-[#140D0A] text-white flex flex-col">
      <Header />
      <main className={`flex-1 ${isStandaloneMobile ? 'pb-0' : 'pb-20 md:pb-0'}`}>
        <Outlet />
      </main>
      <div className={isStandaloneMobile ? 'hidden lg:block' : 'block'}>
        <Footer />
      </div>
      {!isStandaloneMobile && <MobileBottomNav />}
      <AuthModal />
    </div>
  )
}
