import { test, expect } from '@playwright/experimental-ct-react'
import App from '../App'

test('App Component renders heading', async ({ mount }) => {
  const component = await mount(<App />)

  // App initializes a loader first — wait for the h1 to appear after it.
  const heading = component.locator('h1.hero-title')

  // Allow time for the artificial loading animation (up to 15 seconds).
  await expect(heading).toBeVisible({ timeout: 15000 })
  await expect(heading).toContainText(/Ich baue/i)
  await expect(component).toContainText("Offen für Remote-Festanstellung")
  const cvLink = component.locator("a[href=\"/yves-simon-schenker-cv.pdf\"]")
  await expect(cvLink.first()).toBeVisible()
  await expect(cvLink.first()).toHaveAttribute("download", "")
})
