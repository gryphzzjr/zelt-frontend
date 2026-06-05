import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="862519384515-u7ts53qmmjb0cm34mu88e6lmmnvpr838.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
)
