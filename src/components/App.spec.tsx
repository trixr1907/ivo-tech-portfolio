import { test, expect } from '@playwright/experimental-ct-react'
import App from '../App'

test('App Component renders heading', async ({ mount }) => {
  const component = await mount(<App />)

  // App initialisiert zuerst den Loader, der künstlich einige Sekunden braucht.
  // Wir warten auf das h1-Element, das nach dem Loader gemountet wird.
  const heading = component.locator('h1.hero-title')

  // Gib der künstlichen Lade-Animation Zeit (bis zu 15 Sekunden).
  await expect(heading).toBeVisible({ timeout: 15000 })
  await expect(heading).toContainText(/Ich bin/i)
})
