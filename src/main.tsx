import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { RecommendationProvider } from './context/RecommendationContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <RecommendationProvider>
        <App />
      </RecommendationProvider>
    </BrowserRouter>
  </StrictMode>,
)
