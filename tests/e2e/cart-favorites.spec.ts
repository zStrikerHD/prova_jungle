import { expect, test } from '@playwright/test'
import { addFirstNft, login, reset, setScenario } from './helpers'

test.beforeEach(async ({ page }) => reset(page))

test('favorito otimista faz rollback quando a mutation falha', async ({ page }) => {
  await login(page)
  await page.goto('/mercado/nft/1')
  await setScenario(page, 'favorite-error')
  const favorite = page.getByRole('button', { name: 'Favoritar' }).last()
  await favorite.click()
  await expect(page.getByRole('alert')).toContainText(/estado anterior foi restaurado/i)
  await expect(favorite).not.toHaveClass(/bg-\[#D97938\]\/15/)
})

test('carrinho do visitante sobrevive ao refresh e é preservado no login', async ({ page }) => {
  await addFirstNft(page)
  await page.reload()
  await expect(page.getByText('Emerald Ape #042')).toBeVisible()
  await page.getByRole('button', { name: /conectar e finalizar/i }).click()
  await expect(page).toHaveURL(/login/)
  await page.getByLabel('E-mail').fill('alpha@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('Kurio123!')
  await page.getByRole('main').getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/pagamento/)
  await expect(page.getByRole('button', { name: 'Revisar valores' }).filter({ visible: true })).toBeEnabled()
  await expect(page.getByText('1.206 ETH', { exact: true }).filter({ visible: true })).toBeVisible()
})

test('quantidade, remoção e cupons inválido, expirado e válido', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'Matriz detalhada do carrinho no desktop.')
  await login(page)
  await addFirstNft(page)
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await expect(page.getByRole('main').getByText('2', { exact: true })).toBeVisible()
  const coupon = page.getByPlaceholder(/código promocional/i)
  await coupon.fill('INVALIDO'); await page.getByRole('button', { name: 'Aplicar' }).click()
  await expect(page.getByText(/cupom inválido/i)).toBeVisible()
  await coupon.fill('EXPIRED'); await page.getByRole('button', { name: 'Aplicar' }).click()
  await expect(page.getByText(/cupom expirado/i)).toBeVisible()
  await coupon.fill('12345'); await page.getByRole('button', { name: 'Aplicar' }).click()
  await expect(page.getByText(/cupom 12345 aplicado/i)).toBeVisible()
  await page.getByRole('button', { name: /remover emerald/i }).click()
  await expect(page.getByText(/carrinho está vazio/i)).toBeVisible()
})
