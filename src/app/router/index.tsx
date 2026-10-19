import { createRouter } from '@tanstack/react-router'
import { routeTree } from '../../routeTree.gen'

function RoutePending() {
  return (
    <div className="min-h-[935px] lg:min-h-[1730px] w-full px-6 lg:px-[120px] py-12 font-mono" aria-busy="true" aria-label="Carregando página">
      <div className="h-4 w-32 rounded bg-[#251B15] motion-safe:animate-pulse" />
    </div>
  )
}

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPendingMs: 0,
  defaultPendingMinMs: 0,
  defaultPendingComponent: RoutePending,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
