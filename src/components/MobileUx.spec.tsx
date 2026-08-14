import { expect, test } from '@playwright/experimental-ct-react'
import App from '../App'
import { NotFoundPage } from './NotFoundPage'

test.describe('mobile UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
  })

  test('mobile hero uses the fallback and has no horizontal overflow', async ({ mount, page }) => {
    await mount(<App />)
    await expect(page.locator('.loader')).toBeHidden({ timeout: 15_000 })
    const fallback = page.locator('.hero-3d-logo[data-mode="fallback"]')
    const fallbackImage = fallback.locator('.hero-3d-fallback-image')
    await expect(fallback).toBeVisible()
    await expect(fallbackImage).toBeVisible()
    await expect.poll(() => fallbackImage.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    await expect(page.locator('.hero canvas')).toHaveCount(0)
    await expect(page.locator('.pin-spacer')).toHaveCount(0)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
    await expect(page.locator('.hero-ctas .btn-primary')).toBeVisible()
  })

  test('mobile menu behaves as a keyboard modal', async ({ mount, page }) => {
    await mount(<App />)
    const burger = page.locator('.h-burger')
    await expect(burger).toBeVisible()
    await expect(burger).toHaveAttribute('aria-expanded', 'false')
    await page.waitForTimeout(900)
    await burger.click()

    const dialog = page.getByRole('dialog', { name: 'Mobile Navigation' })
    const firstLink = dialog.getByRole('link', { name: 'Über mich' })
    const lastLink = dialog.getByRole('link', { name: 'Kontakt aufnehmen' })
    await expect(burger).toHaveAttribute('aria-expanded', 'true')
    await expect(firstLink).toBeFocused()
    await expect.poll(() => page.evaluate(() => [document.body.style.overflow, document.documentElement.style.overflow])).toEqual(['hidden', 'hidden'])

    await page.keyboard.press('Shift+Tab')
    await expect(lastLink).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(firstLink).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(burger).toBeFocused()
  })

  for (const width of [320, 390]) {
    test(`footer and legal links remain inside a ${width}px viewport`, async ({ mount, page }) => {
      await page.setViewportSize({ width, height: 844 })
      await mount(<App />)
      const footer = page.locator('.relaunch-footer')
      await footer.scrollIntoViewIfNeeded()
      await expect(footer).toBeVisible()
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
      for (const name of ['Impressum', 'Datenschutz']) {
        const box = await footer.getByRole('link', { name }).boundingBox()
        expect(box).not.toBeNull()
        expect(box!.x).toBeGreaterThanOrEqual(0)
        expect(box!.x + box!.width).toBeLessThanOrEqual(width)
      }
    })
  }

  test('primary touch controls meet sizing at 320px', async ({ mount, page }) => {
    await page.setViewportSize({ width: 320, height: 844 })
    await mount(<App />)
    await page.locator('#kontakt').scrollIntoViewIfNeeded()
    const controls = page.locator('.h-burger, .hero-ctas a, .contact-relaunch-actions a, .relaunch-footer nav a')
    await expect.poll(async () => {
      const sizes = await controls.evaluateAll((elements) => elements.filter((element) => getComputedStyle(element).display !== 'none').map((element) => element.getBoundingClientRect()))
      return sizes.length > 0 && sizes.every((size) => size.height >= 44)
    }).toBe(true)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  })

  test('768px uses only mobile navigation without overflow', async ({ mount, page }) => {
    await page.setViewportSize({ width: 768, height: 900 })
    await mount(<App />)
    await expect(page.locator('.h-burger')).toBeVisible()
    await expect(page.locator('.h-nav')).toBeHidden()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  })
})

test('not found page exposes branded recovery navigation', async ({ mount, page }) => {
  await mount(<NotFoundPage />)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Diese Seite ist nicht im System')
  await expect(page.getByRole('link', { name: 'Zur Startseite' })).toHaveAttribute('href', '/')
})
