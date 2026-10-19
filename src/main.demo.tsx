import { enableMocking } from '@/mocks/browser'
import { renderApp } from '@/renderApp'
import '@/app/styles/index.css'

void enableMocking()
  .catch((error) => {
    console.error('Falha ao iniciar os mocks de rede.', error)
  })
  .finally(() => {
    renderApp()
  })

