import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/authContext.tsx'
import { BrandingProvider } from './context/BrandingContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'
import { ToastContainer } from './components/UI/ToastContainer.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <AuthProvider>
            <BrandingProvider>
              <ToastProvider>
                <App />
                <ToastContainer />
              </ToastProvider>
            </BrandingProvider>
          </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
