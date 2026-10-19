import { renderApp } from '@/renderApp'
import '@/app/styles/index.css'

async function prepareMocks() {
  if (import.meta.env.MODE !== 'development' && import.meta.env.VITE_ENABLE_MOCKS !== 'true') return
  const { enableMocking } = await import('@/mocks/browser')
  await enableMocking()
}

void prepareMocks().then(renderApp).catch((error) => {
  console.error('Falha ao iniciar a aplicação.', error)
})
