import { useEffect } from 'react'
import { useSelector } from 'react-redux'

/**
 * Custom hook to apply theme settings from environment variables.
 *
 * Supported env vars:
 * - DEKART_UX_THEME: "light", "dark", or "auto" (follows system preference)
 * - DEKART_UX_PRIMARY_COLOR: Primary color hex (e.g., "#262626")
 * - DEKART_UX_ACCENT_COLOR: Accent color hex (e.g., "#FFF65D")
 * - DEKART_UX_LOGO_URL: URL to custom logo (can be GCS URL)
 * - DEKART_UX_FONT_URL: URL to custom font (woff2)
 */
export function useTheme() {
  const env = useSelector(state => state.env)
  const { variables, loaded } = env

  useEffect(() => {
    if (!loaded) return

    const root = document.documentElement

    // Apply theme
    const theme = variables.UX_THEME || 'light'
    if (theme === 'auto') {
      // Follow system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')

      // Listen for changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e) => root.setAttribute('data-theme', e.matches ? 'dark' : 'light')
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      root.setAttribute('data-theme', theme)
    }

    // Apply custom colors
    if (variables.UX_PRIMARY_COLOR) {
      root.style.setProperty('--color-primary', variables.UX_PRIMARY_COLOR)
    }
    if (variables.UX_ACCENT_COLOR) {
      root.style.setProperty('--color-accent', variables.UX_ACCENT_COLOR)
    }

    // Apply custom logo URL as CSS variable
    if (variables.UX_LOGO_URL) {
      root.style.setProperty('--custom-logo-url', `url("${variables.UX_LOGO_URL}")`)
    }

    // Apply custom font
    if (variables.UX_FONT_URL) {
      // Create @font-face dynamically
      const fontStyle = document.createElement('style')
      fontStyle.textContent = `
        @font-face {
          font-family: 'CustomFont';
          src: url('${variables.UX_FONT_URL}') format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
      `
      document.head.appendChild(fontStyle)
      root.style.setProperty('--font-family', "'CustomFont', 'Yellix', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif")
    }
  }, [loaded, variables])
}

export default useTheme
