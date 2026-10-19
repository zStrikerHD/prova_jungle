import { expect, type Page } from '@playwright/test'

export async function reset(page: Page) {
  await page.goto('/')
  await page.evaluate(async () => {
    localStorage.removeItem('kurio_mock_scenario')
    sessionStorage.clear()
    await fetch('/api/test/reset', { method: 'POST' })
  })
}

export async function setScenario(page: Page, scenario: string) {
  await page.evaluate((value) => value === 'default' ? localStorage.removeItem('kurio_mock_scenario') : localStorage.setItem('kurio_mock_scenario', value), scenario)
}

export async function login(page: Page, email = 'alpha@kurio.test') {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha', { exact: true }).fill('Kurio123!')
  await page.getByRole('main').getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/perfil/)
}

export async function addFirstNft(page: Page) {
  await page.goto('/mercado/nft/1')
  await page.getByRole('button', { name: /^comprar/i }).click()
  await expect(page).toHaveURL(/cart/)
}

export async function reachPayment(page: Page) {
  await addFirstNft(page)
  await page.getByRole('button', { name: /finalizar|conectar e finalizar/i }).click()
  await expect(page).toHaveURL(/pagamento/)
}
