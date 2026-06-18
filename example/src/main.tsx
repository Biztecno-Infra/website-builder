import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { configureAssetApi } from "page-builder";

configureAssetApi({
  url:   import.meta.env.VITE_ASSET_API_URL,
  token: import.meta.env.VITE_ASSET_API_TOKEN,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
