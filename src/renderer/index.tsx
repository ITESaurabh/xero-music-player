import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import App from './App';
import './styles/core.scss';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { StateProvider } from './utils/store.js';
import { IpcProvider } from './state/ipc.js';

const root = createRoot(document.getElementById('app')!);

root.render(
  <React.StrictMode>
    <StateProvider>
      <IpcProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </IpcProvider>
    </StateProvider>
  </React.StrictMode>
);
