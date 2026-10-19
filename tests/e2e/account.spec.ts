import { expect, test } from '@playwright/test'
import { login, reset, setScenario } from './helpers'

test.beforeEach(async ({ page }) => reset(page))

test('cadastro valida campos e trata conflito', async ({ page }) => {
  await page.goto('/cadastro')
  await page.getByLabel('Nome de usuário').fill('novo_user')
  await page.getByLabel('E-mail').fill('alpha@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('Kurio123!')
  await page.getByLabel('Confirmar senha', { exact: true }).fill('Kurio123!')
  await page.getByRole('button', { name: 'Criar perfil' }).click()
  await expect(page.getByRole('alert')).toContainText(/já está cadastrado/i)
})

test('expiração preserva a rota privada para retomada', async ({ page }) => {
  await login(page)
  await setScenario(page, 'session-expired')
  await page.goto('/carteiras')
  await expect(page).toHaveURL(/login/)
  await page.waitForLoadState('load')
  await setScenario(page, 'default')
  await page.getByLabel('E-mail').fill('alpha@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('Kurio123!')
  await page.getByRole('main').getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/carteiras/)
})

test('perfil, avatar, senha e carteira persistem e exibem validação', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'Cobertura detalhada de conta no viewport desktop; o fluxo principal também roda em mobile.')
  await login(page)
  await page.getByPlaceholder('Nome de exibição').fill('Alpha Atualizado')
  await page.getByRole('button', { name: 'Alterar' }).click()
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByText(/alterações salvas/i)).toBeVisible()
  await page.reload()
  await expect(page.getByPlaceholder('Nome de exibição')).toHaveValue('Alpha Atualizado')

  await page.getByPlaceholder('Senha atual').fill('incorreta')
  await page.getByPlaceholder('Nova senha', { exact: true }).fill('NovaSenha123!')
  await page.getByPlaceholder('Confirmar nova senha', { exact: true }).fill('NovaSenha123!')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText(/senha atual incorreta/i)

  await page.getByRole('button', { name: 'Carteiras' }).click()
  await page.getByRole('button', { name: 'Adicionar', exact: true }).first().click()
  await page.getByPlaceholder('Apelido da carteira').fill('Carteira teste')
  await page.getByPlaceholder('Endereço 0x da carteira').fill('endereço-inválido')
  await page.locator('select').filter({ has: page.locator('option[value="ethereum"]') }).selectOption('ethereum')
  await page.locator('select').filter({ has: page.locator('option[value="metamask"]') }).selectOption('metamask')
  await page.getByRole('button', { name: /salvar carteira/i }).click()
  await expect(page.getByRole('alert')).toContainText(/inválido|revise/i)
  await page.getByPlaceholder('Endereço 0x da carteira').fill('0x1111111111111111111111111111111111111111')
  await page.getByRole('button', { name: /salvar carteira/i }).click()
  await expect(page.getByText(/salva com sucesso/i)).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: 'Carteiras' }).click()
  await expect(page.getByRole('button', { name: /Carteira teste/ })).toBeVisible()
})
