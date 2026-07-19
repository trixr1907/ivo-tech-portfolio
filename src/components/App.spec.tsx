import { test, expect } from '@playwright/experimental-ct-react'
import App from '../App'

test('App Component renders heading', async ({ mount, page }) => {
  await page.setViewportSize({ width: 1920, height: 900 })
  const component = await mount(<App />)

  // App initializes a loader first — wait for the h1 to appear after it.
  const heading = component.locator('h1.hero-title')

  // Allow time for the artificial loading animation (up to 15 seconds).
  await expect(heading).toBeVisible({ timeout: 15000 })
  await expect(heading).toContainText('Ich baue, was bleibt.')
  const titleLines = heading.locator('.title-line')
  await expect(titleLines).toHaveCount(2)
  await expect
    .poll(() => titleLines.evaluateAll((lines) => lines.every((line) => line.scrollWidth <= line.clientWidth)))
    .toBe(true)
  await expect(component.locator('.hero-ctas .btn-primary')).toHaveCount(1)
  await expect(component).toContainText('Offen für Remote-Festanstellung')
  const cvLink = component.locator('a[href="/yves-simon-schenker-cv.pdf"]')
  await expect(cvLink.first()).toBeVisible()
  await expect(cvLink.first()).toHaveAttribute('download', '')
})

test('reduced motion uses a static hero without pinning or WebGL', async ({ mount, page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await mount(<App />)
  await expect(page.locator('.loader')).toBeHidden({ timeout: 15_000 })

  const fallback = page.locator('.hero-3d-logo[data-mode="fallback"]')
  await expect(fallback).toBeVisible()
  await expect(fallback.locator('.hero-3d-fallback-image')).toBeVisible()
  await expect(page.locator('.hero canvas')).toHaveCount(0)
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
  await expect.poll(async () => (await page.locator('.hero').boundingBox())?.height ?? 0).toBeLessThanOrEqual(720)
})
