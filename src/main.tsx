import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register the service worker in one place for a minimal offline fallback.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Non-fatal: the site works without the offline fallback.
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
