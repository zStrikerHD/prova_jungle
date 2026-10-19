import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/mercado/')({
  beforeLoad: () => {
    throw redirect({
      to: '/mercado/nft/$id',
      params: { id: '1' },
    })
  },
  component: () => null,
})
