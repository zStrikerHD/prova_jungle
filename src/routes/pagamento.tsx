import { createFileRoute } from '@tanstack/react-router'
import { CheckoutPage } from '@/features/checkout'
import { requireAuth } from '@/features/auth/guard'

export const Route = createFileRoute('/pagamento')({
  beforeLoad: ({ location }) => requireAuth(location),
  component: CheckoutRoutePage,
})

function CheckoutRoutePage() {
  return <CheckoutPage />
}
