import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/nft/$id')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/mercado/nft/$id',
      params: { id: params.id },
    })
  },
  component: () => null,
})
