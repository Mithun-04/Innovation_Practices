import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LoginForm from './Components/LoginForm.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoginForm />
  </StrictMode>,
)
