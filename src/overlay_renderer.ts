import React from 'react';
import { createRoot } from 'react-dom/client';
import OverlayApp from './renderer/OverlayApp';

const root = createRoot(document.getElementById('app')!);
root.render(React.createElement(OverlayApp));
