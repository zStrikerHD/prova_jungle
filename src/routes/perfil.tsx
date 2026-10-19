import { createFileRoute } from '@tanstack/react-router'
import { CollectorProfile } from '@/features/profile'
import { requireAuth } from '@/features/auth/guard'

export const Route = createFileRoute('/perfil')({
  beforeLoad: ({ location }) => requireAuth(location),
  component: ProfilePage,
})

function ProfilePage() {
  return <CollectorProfile />
}
