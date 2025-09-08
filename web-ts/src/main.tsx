import { StrictMode } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import YesYourGoat from './modes/yesyourgoat/YesYourGoat.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/yesyourgoat" element={<YesYourGoat />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
