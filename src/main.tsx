import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/index.css'
import App from '@/app/App'
import { AppProviders } from '@/app/providers/app-providers'
import { useUserStore } from '@/store/useUserStore'

void useUserStore.getState().hydrate()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)