import { test, expect } from '@playwright/experimental-ct-react'
import App from '../App'

test.describe('Landingpage Sections', () => {
  test.beforeEach(async ({ mount }) => {
    const component = await mount(<App />)
    // Loader abwarten
    const loader = component.locator('.loader')
    await expect(loader).toBeHidden({ timeout: 15000 })
  })

  test('About Section renders correctly', async ({ page }) => {
    // Scroll to About section
    const aboutSection = page.locator('#about')
    await aboutSection.scrollIntoViewIfNeeded()
    
    // Verify current headline content
    await expect(aboutSection.locator('h2')).toContainText(/Neue Probleme/i)
  })

  test('Lab Section contains feature cards', async ({ page }) => {
    const labSection = page.locator('#lab')
    await labSection.scrollIntoViewIfNeeded()
    
    // Prüfe, ob 4 Lab Cards da sind
    const cards = labSection.locator('article.lab-card')
    await expect(cards).toHaveCount(4)
  })

  test('Navigation renders correctly', async ({ page }) => {
    const navPanel = page.locator('nav.h-nav')
    await expect(navPanel).toBeVisible()
    
    // Prüfen, ob die Links vorhanden sind
    const links = navPanel.locator('a.h-link')
    await expect(links).toHaveCount(4)
    await expect(links.first()).toContainText('About')
  })
})
