import type { Preview } from '@storybook/react-vite'
import { withThemeByClassName } from '@storybook/addon-themes'
import '../src/styles/index.css'

export const decorators = [
  withThemeByClassName({
    themes: {
      Dark: 'dark',
      Light: 'light',
    },
    defaultTheme: 'Dark',
    parentSelector: 'html',
  }),
]

export const parameters: Preview['parameters'] = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/i,
    },
  },
  a11y: {
    test: 'error',
  },
  layout: 'padded',
}

export default {
  decorators,
  parameters,
} satisfies Preview