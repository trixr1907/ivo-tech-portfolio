import { expect, test } from '@playwright/experimental-ct-react'
import App from '../App'
import { NotFoundPage } from './NotFoundPage'

test.describe('mobile UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
  })

  test('mobile menu behaves as a keyboard modal', async ({ mount, page }) => {
    await mount(<App />)
    await expect(page.locator('.loader')).toBeHidden({ timeout: 15_000 })

    const burger = page.locator('.h-burger')
    await expect(burger).toBeVisible()
    await expect(burger).toHaveAttribute('aria-expanded', 'false')
    await expect(burger).toHaveAccessibleName('Menü öffnen')

    await page.evaluate(() => {
      document.body.style.overflow = 'visible'
      document.documentElement.style.overflow = 'clip'
    })
    await burger.click()

    const dialog = page.getByRole('dialog', { name: 'Mobile Navigation' })
    const firstLink = dialog.getByRole('link', { name: 'About' })
    const lastLink = dialog.getByRole('link', { name: 'Kontakt' })
    await expect(burger).toHaveAttribute('aria-expanded', 'true')
    await expect(burger).toHaveAccessibleName('Menü schließen')
    await expect(firstLink).toBeFocused()
    await expect.poll(() => page.evaluate(() => [document.body.style.overflow, document.documentElement.style.overflow])).toEqual(['hidden', 'hidden'])

    await page.keyboard.press('Shift+Tab')
    await expect(lastLink).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(firstLink).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(burger).toHaveAttribute('aria-expanded', 'false')
    await expect(burger).toHaveAccessibleName('Menü öffnen')
    await expect(burger).toBeFocused()
    await expect.poll(() => page.evaluate(() => [document.body.style.overflow, document.documentElement.style.overflow])).toEqual(['visible', 'clip'])
  })

  for (const width of [320, 390]) {
    test(`footer remains inside a ${width}px viewport`, async ({ mount, page }) => {
      await page.setViewportSize({ width, height: 844 })
      await mount(<App />)
      await expect(page.locator('.loader')).toBeHidden({ timeout: 15_000 })

      const footer = page.locator('.site-footer')
      await footer.scrollIntoViewIfNeeded()
      await expect(footer).toBeVisible({ timeout: 15_000 })
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)

      for (const name of ['Impressum', 'Datenschutz']) {
        const box = await footer.getByRole('link', { name }).boundingBox()
        expect(box).not.toBeNull()
        expect(box!.x).toBeGreaterThanOrEqual(0)
        expect(box!.x + box!.width).toBeLessThanOrEqual(width)
      }
    })
  }
})

test('not found page exposes branded recovery navigation', async ({ mount, page }) => {
  await mount(<NotFoundPage />)
  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Diese Seite ist nicht im System')
  await expect(page.getByRole('link', { name: 'Zur Startseite' })).toHaveAttribute('href', '/')
})
