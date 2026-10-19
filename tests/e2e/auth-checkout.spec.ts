import { test, expect, type Page } from '@playwright/test'

async function login(page: Page) {
  await page.goto('/login')
  await page.locator('input[type=email]').first().fill('alpha@kurio.test')
  await page.locator('input[type=password]').first().fill('Kurio123!')
  await page.getByRole('main').getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/perfil/)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => fetch('/api/test/reset', { method: 'POST' }))
})

test('protege rota privada, autentica e recupera a sessão no refresh', async ({ page }) => {
  await page.goto('/perfil')
  await expect(page).toHaveURL(/login/)
  await login(page)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible()
})

test('pedido usa cotação, idempotência e confirmação assíncrona', async ({ page }) => {
  await login(page)
  await page.goto('/mercado/nft/1')
  await page.getByRole('button', { name: /^comprar/i }).click()
  await expect(page).toHaveURL(/cart/)
  await page.getByRole('button', { name: /finalizar|conectar e finalizar/i }).click()
  await expect(page).toHaveURL(/pagamento/)
  await page.getByRole('button', { name: 'Revisar valores' }).first().click()
  await page.getByRole('button', { name: 'Confirmar valores e comprar' }).first().click()
  await expect(page.getByRole('dialog', { name: 'Confirmação do pedido' })).toBeVisible({ timeout: 8_000 })
  await expect(page.getByText(/Seus NFTs agora estão na sua carteira/i)).toBeVisible()
})
