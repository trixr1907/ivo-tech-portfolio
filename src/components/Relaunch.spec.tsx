import { expect, test } from '@playwright/experimental-ct-react'
import App from '../App'

test.describe('focused portfolio structure', () => {
  test.beforeEach(async ({ mount, page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await mount(<App />)
    await expect(page.locator('.loader')).toBeHidden({ timeout: 15_000 })
  })

  test('renders three evidence-based cases and opens a case study', async ({ page }) => {
    const cards = page.locator('.relaunch-project-card')
    await expect(cards).toHaveCount(3)
    await expect.poll(async () => cards.locator('img').evaluateAll((images) => images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true)
    await expect(cards.nth(0)).toContainText('GOALS Optimizer')
    await expect(cards.nth(0)).toHaveClass(/relaunch-project-card--primary/)
    await expect(cards.nth(0).locator('.project-card__status')).toHaveText('Primärer Case')
    await expect(cards.nth(1)).toContainText('Event Management Hub')
    await expect(cards.nth(2)).toContainText('DLD 3D-Konfigurator')

    await cards.first().locator('button').click()
    const dialog = page.getByRole('dialog', { name: /GOALS Optimizer/ })
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('371 Tests')
    await dialog.getByRole('button', { name: 'Schliessen' }).click()
    await expect(dialog).toBeHidden()
  })

  test('keeps the public story focused', async ({ page }) => {
    await expect(page.locator('#craft')).toBeVisible()
    await expect(page.locator('#craft .principle-proof')).toHaveCount(3)
    await expect(page.locator('#craft a[href="#project-goals-optimizer"]')).toContainText('371 Tests')
    await expect(page.locator('#craft a[href="#project-event-hub"]')).toContainText('RLS, Audit-Trail und Edge Functions')
    await expect(page.locator('#craft a[href="#project-dld-3d-configurator"]')).toContainText('live im produktiven Shop')
    await expect(page.locator('#lab .lab-relaunch-card')).toHaveCount(4)
    await expect(page.locator('#kontakt')).toContainText('Lass uns etwas bauen')
    await expect(page.getByText('Realtime Data')).toHaveCount(0)
    await expect(page.getByText('Helium Mining')).toHaveCount(0)
  })
})
