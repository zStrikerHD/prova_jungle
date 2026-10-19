import { test, expect, type Page } from '@playwright/test'

async function stable(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.waitForLoadState('domcontentloaded')
  await page.locator('main').waitFor({ state: 'visible' })
  await page.waitForTimeout(500)
}

async function authenticatedCart(page: Page) {
  await page.goto('/')
  await stable(page)
  await page.evaluate(async () => {
    await fetch('/api/test/reset', { method: 'POST' })
    const auth = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'alpha@kurio.test', password: 'Kurio123!' }) })
    if (!auth.ok) throw new Error(`Falha no login de teste: ${auth.status}`)
    const session = await auth.json(); localStorage.setItem('auth_token', session.token)
    const nft = await (await fetch('/api/nfts/1')).json()
    await fetch('/api/cart', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` }, body: JSON.stringify({ items: [{ nftId: nft.id, nft, quantity: 1, edition: nft.edition }] }) })
  })
}

test('início', async ({ page }) => { await page.goto('/'); await stable(page); await expect(page).toHaveScreenshot('home.png', { fullPage: true, maxDiffPixelRatio: 0.02 }) })
test('detalhe', async ({ page }) => { await page.goto('/mercado/nft/1'); await stable(page); await expect(page).toHaveScreenshot('detail.png', { fullPage: true, maxDiffPixelRatio: 0.02 }) })
test('carrinho', async ({ page }) => { await authenticatedCart(page); await page.goto('/cart'); await stable(page); await expect(page).toHaveScreenshot('cart.png', { fullPage: true, maxDiffPixelRatio: 0.02 }) })
test('pagamento', async ({ page }) => { await authenticatedCart(page); await page.goto('/pagamento'); await stable(page); await expect(page).toHaveScreenshot('payment.png', { fullPage: true, maxDiffPixelRatio: 0.02 }) })
