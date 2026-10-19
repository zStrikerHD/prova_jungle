import { expect, test } from '@playwright/test'
import { reset } from './helpers'

test.beforeEach(async ({ page }) => reset(page))

test('diálogo prende o foco, fecha com Escape e formulários expõem nomes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'Teste do modal aberto pelo cabeçalho desktop.')
  await page.getByRole('button', { name: 'Entrar' }).click()
  const dialog = page.getByRole('dialog', { name: 'Entrar' })
  await expect(dialog).toBeVisible()
  await expect(page.locator(':focus')).toHaveAttribute('aria-label', /fechar/i)
  await page.keyboard.press('Shift+Tab')
  await expect(page.locator(':focus')).toBeVisible()
  await expect(dialog.locator(':focus')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()

  await page.goto('/cadastro')
  await expect(page.getByLabel('Nome de usuário')).toBeVisible()
  await expect(page.getByLabel('E-mail')).toBeVisible()
  await expect(page.getByLabel('Senha', { exact: true })).toBeVisible()
})

test('telas principais não criam overflow horizontal em 390, 768 e 1440 px', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'A própria prova alterna os três viewports nesta verificação.')
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of ['/', '/mercado/nft/1', '/cart']) {
      await page.goto(route)
      await page.locator('main').waitFor()
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
      expect(overflow, `${route} possui overflow em ${width}px`).toBeFalsy()
    }
  }
})
