import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log("UTG: Main entry point execution started.");
const rootElement = document.getElementById('root');

if (rootElement) {
  console.log("UTG: Root element found, starting React render.");
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  console.error("UTG: Root element NOT found!");
}
