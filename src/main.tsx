import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import './dark-mode.css';
import './typography.css';
import { authService } from './services/auth.service';
import { storageService } from './services/storage.service';

if (typeof window !== 'undefined') {
  (window as any).authService = authService;
  (window as any).storageService = storageService;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
