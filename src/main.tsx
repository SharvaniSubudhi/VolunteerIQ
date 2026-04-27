import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const resizeObserverErrRe = /ResizeObserver loop completed with undelivered notifications/;
window.addEventListener('error', (e) => {
  if (resizeObserverErrRe.test(e.message)) {
    e.stopImmediatePropagation();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
