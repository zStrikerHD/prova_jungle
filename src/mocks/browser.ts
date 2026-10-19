import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

export async function enableMocking() {
  if (import.meta.env.MODE !== 'development' && import.meta.env.VITE_ENABLE_MOCKS !== 'true') {
    return
  }

  return worker.start()
}
