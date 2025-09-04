import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register';


if ('serviceWorker' in navigator) {
  registerSW({
    onNeedRefresh() {
      // Logic to show a "New content is available" message to the user
    },
    onOfflineReady() {
      // Logic to show a "App is ready to be used offline" message
    },
  });
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
