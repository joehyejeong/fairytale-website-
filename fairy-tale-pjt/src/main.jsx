import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './fonts.css'
import './styles/variables.css'  // CSS 변수 (fonts.css 포함)
import './styles/base.css'       // 기본 스타일 + Tailwind
import './styles/colors.css'     // 커스텀 색상 클래스


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
