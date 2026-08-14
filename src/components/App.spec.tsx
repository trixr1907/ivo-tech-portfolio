import { expect, test } from '@playwright/experimental-ct-react'
import App from '../App'

test('relaunch hero communicates the positioning and primary actions', async ({ mount, page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  const component = await mount(<App />)
  const heading = component.locator('h1.hero-title')

  await expect(heading).toBeVisible({ timeout: 15_000 })
  await expect(heading).toContainText('Ich baue, was bleibt.')
  await expect(component).toContainText('Full-Stack Development / Frontend Craft')
  await expect(component.locator('.hero-eyebrow')).toContainText('Ivo')
  await expect(component.locator('#about')).toContainText('Ich bin Ivo.')
  await expect(component.locator('#about img[alt="Portrait von Ivo"]')).toBeVisible()
  await expect(component.getByRole('link', { name: 'Über mich' }).first()).toHaveAttribute('href', '#about')
  await expect(component).toContainText('Offen für passende Remote- und Hybrid-Rollen')
  await expect(component.locator('.hero-ctas .btn-primary')).toHaveAttribute('href', '#selected-work')
  await expect(component.locator('.hero-ctas a[href="/yves-simon-schenker-cv.pdf"]')).toHaveAttribute('download', '')

  const titleLines = heading.locator('.title-line')
  await expect(titleLines).toHaveCount(2)
  await expect
    .poll(() => titleLines.evaluateAll((lines) => lines.every((line) => line.scrollWidth <= line.clientWidth + 1)))
    .toBe(true)
})

test('reduced motion uses static media without WebGL or autoplay video', async ({ mount, page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await mount(<App />)
  await expect(page.locator('.loader')).toBeHidden({ timeout: 15_000 })

  const fallback = page.locator('.hero-3d-logo[data-mode="fallback"]')
  await expect(fallback).toBeVisible()
  await expect(fallback.locator('.hero-3d-fallback-image')).toBeVisible()
  await expect(page.locator('.hero canvas')).toHaveCount(0)
  await expect(page.locator('.craft-video-frame video')).toHaveCount(0)
  await expect(page.locator('.craft-video-frame img')).toBeVisible()
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
})
