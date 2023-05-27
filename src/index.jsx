import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./renderer/styles/core.scss";
import { StateProvider } from "./renderer/utils/store.js";

const root = ReactDOM.createRoot(document.getElementById("app"));
function render() {
  root.render(
    <React.StrictMode>
      <StateProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </StateProvider>
    </React.StrictMode>
  );
}

render();
