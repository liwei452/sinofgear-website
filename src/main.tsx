import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { prepareRootElement } from './lib/prerender.ts'
import { initializeAnalytics } from './analytics/analytics.ts'

const rootElement = document.getElementById('root')!
prepareRootElement(rootElement)
initializeAnalytics()

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
