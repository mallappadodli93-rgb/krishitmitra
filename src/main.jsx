import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { OfflineProvider } from './context/OfflineContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <OfflineProvider>
        <App />
      </OfflineProvider>
    </LanguageProvider>
  </React.StrictMode>,
)
