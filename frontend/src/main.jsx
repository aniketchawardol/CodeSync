import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from '@auth0/auth0-react';

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Auth0Provider
    domain="dev-74pp57b6cxcc4b4l.us.auth0.com"
    clientId="is5zoZK5Ff1INpddNMBEqCSEg8hngrns"
    authorizationParams={{
      redirect_uri: "http://localhost:5173/"
    }}
  >
    <App />
  </Auth0Provider>,
  </BrowserRouter>,
);
