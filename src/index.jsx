import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './renderer/styles/core.scss';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { StateProvider } from './renderer/utils/store.js';
import { IpcProvider } from './renderer/state/ipc.js';

const root = ReactDOM.createRoot(document.getElementById('app'));
function render() {
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
}

render();
