import { createFileRoute } from '@tanstack/react-router'
import { CollectorProfile } from '@/features/profile'
import { requireAuth } from '@/features/auth/guard'

export const Route = createFileRoute('/carteiras')({
  beforeLoad: ({ location }) => requireAuth(location),
  component: WalletsPage,
})

function WalletsPage() {
  return <CollectorProfile initialTab="carteiras" />
}
