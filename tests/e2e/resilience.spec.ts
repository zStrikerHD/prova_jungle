import { expect, test } from '@playwright/test'
import { login, reachPayment, reset, setScenario } from './helpers'

test.beforeEach(async ({ page }) => reset(page))

test('mudança de preço invalida a cotação e exige nova confirmação', async ({ page }) => {
  await login(page); await reachPayment(page)
  await page.getByRole('button', { name: 'Revisar valores' }).first().click()
  await setScenario(page, 'price-changed')
  await page.getByRole('button', { name: /confirmar valores/i }).first().click()
  await expect(page.getByRole('status')).toContainText(/preço ou disponibilidade mudou/i)
  await page.getByRole('button', { name: /confirmar valores/i }).first().click()
  await expect(page.getByRole('dialog', { name: /confirmação do pedido/i })).toBeVisible({ timeout: 8_000 })
})

test('pagamento recusado mantém os itens', async ({ page }) => {
  await login(page); await reachPayment(page); await setScenario(page, 'payment-declined')
  await page.getByRole('button', { name: 'Revisar valores' }).first().click()
  await page.getByRole('button', { name: /confirmar valores/i }).first().click()
  await expect(page.getByRole('status')).toContainText(/pagamento recusado/i, { timeout: 8_000 })
  await page.goto('/cart')
  await expect(page.getByText('Emerald Ape #042')).toBeVisible()
})

test('timeout após criação recupera o mesmo pedido no refresh', async ({ page }) => {
  await login(page); await reachPayment(page); await setScenario(page, 'order-timeout')
  await page.getByRole('button', { name: 'Revisar valores' }).first().click()
  await page.getByRole('button', { name: /confirmar valores/i }).first().click()
  await expect(page.getByRole('status')).toContainText(/mesma tentativa será recuperada/i)
  await setScenario(page, 'default')
  await page.reload()
  await expect(page.getByRole('dialog', { name: /confirmação do pedido/i })).toBeVisible({ timeout: 8_000 })
})

test('latência mostra skeleton e falha de conexão permite tentar novamente', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'Cenários de resiliência visual detalhados no desktop.')
  await setScenario(page, 'slow'); await page.reload()
  await expect(page.locator('.animate-pulse').first()).toBeVisible()
  await setScenario(page, 'network-error'); await page.reload()
  await expect(page.getByRole('alert')).toContainText(/não foi possível carregar/i, { timeout: 8_000 })
  await setScenario(page, 'default')
  await page.getByRole('button', { name: /tentar novamente/i }).click()
  await expect(page.getByText('Emerald Ape #042').first()).toBeVisible()
})

test('Socket.IO atualiza o carrinho e ignora evento antigo ou duplicado', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'Cenário técnico de ordenação coberto uma vez no Chromium desktop.')
  await login(page); await reachPayment(page)
  await expect(page.locator('html')).toHaveAttribute('data-socket-connected', 'true')
  await page.getByRole('button', { name: 'Revisar valores' }).first().click()
  const update = await page.evaluate(async () => (await fetch('/api/test/nfts/1', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ priceEth: '2.123456789123456789' }) })).json())
  await expect(page.getByText(/preço ou disponibilidade alterados/i)).toBeVisible()
  await page.evaluate(async ({ version }) => {
    const nft = await (await fetch('/api/nfts/1')).json()
    await fetch('/api/test/events/nft.updated', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resourceId: '1', version: version - 1, nft: { ...nft, priceEth: '0.01' } }) })
    await fetch('/api/test/events/nft.updated', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resourceId: '1', version, nft }) })
  }, update)
  await page.goto('/cart')
  await expect(page.getByText('2.123456789123456789 ETH').first()).toBeVisible()
})
