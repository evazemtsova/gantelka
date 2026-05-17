import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WorkoutsProvider } from './store/WorkoutsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WorkoutsProvider>
      <App />
    </WorkoutsProvider>
  </StrictMode>,
)
