import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        if (import.meta.env.DEV) {
          console.log('SW registered: ', registration);
        }
      })
      .catch((registrationError) => {
        if (import.meta.env.DEV) {
          console.log('SW registration failed: ', registrationError);
        }
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
