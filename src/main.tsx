// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { DirectionProvider } from "./context/direction-provider";
import { FontProvider } from "./context/font-provider";
import { ThemeProvider } from "./context/theme-provider";
import { store } from "./redux/store";
import "./index.css";
import "./styles/dashboard-related/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <FontProvider>
        <Provider store={store}>
          <DirectionProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </DirectionProvider>
        </Provider>
      </FontProvider>
    </ThemeProvider>
  </React.StrictMode>
);

