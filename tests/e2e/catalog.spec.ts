import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => fetch('/api/test/reset', { method: 'POST' }))
})

test.describe('Catálogo e descoberta', () => {
  test('busca, ordenação e paginação permanecem na URL e no histórico', async ({ page }) => {
    await page.getByLabel('Buscar NFTs').fill('Emerald')
    await expect(page).toHaveURL(/q=Emerald/)
    await page.getByRole('combobox').last().selectOption('price_desc')
    await expect(page).toHaveURL(/sort=price_desc/)
    await page.goBack()
    await expect(page.getByLabel('Buscar NFTs')).toHaveValue('Emerald')
  })

  test('acesso direto trata NFT inexistente', async ({ page }) => {
    await page.goto('/mercado/nft/inexistente')
    await expect(page.getByRole('heading', { name: 'NFT não encontrado' })).toBeVisible()
  })
})
