import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Apply persisted theme before first render to avoid flash
const savedUI = JSON.parse(localStorage.getItem('feedne_ui') || '{}');
if (savedUI?.state?.theme === 'dark') {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
