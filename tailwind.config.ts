import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors (keeping for backwards compatibility)
        signal: '#0EA5E9',
        wasted: '#404040',
        neutral: '#808080',
        // New 5-level quality system
        deep: '#0EA5E9',      // Deep work (electric blue)
        focused: '#06B6D4',   // Focused work (cyan)
        medium: '#808080',    // Neutral/medium (gray)
        distracted: '#F59E0B', // Distracted (orange)
        lost: '#EF4444',      // Wasted/lost time (red)
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config

