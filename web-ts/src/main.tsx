import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import YesYourGoat from './modes/yesyourgoat/YesYourGoat.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <YesYourGoat />
  </StrictMode>,
)
