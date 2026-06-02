import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./app/App.tsx";
import "./styles/index.css";

const GOOGLE_CLIENT_ID = "87250051752-p12lltrop700iehbui5pije6r1h6jn4e.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
  