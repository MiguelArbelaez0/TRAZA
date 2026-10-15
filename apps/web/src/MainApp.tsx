import { useCallback, useEffect, useState } from "react";
import App from "./App";
import AuthScreen from "./AuthScreen";
import { authApi, type AuthResponse } from "./authApi";

const TOKEN_KEY = "traza_access_token";

export default function MainApp() {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [checking, setChecking] = useState(
    () => Boolean(sessionStorage.getItem(TOKEN_KEY)),
  );

  const acceptSession = useCallback((data: AuthResponse) => {
    sessionStorage.setItem(TOKEN_KEY, data.access_token);
    setSession(data);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setSession(null);
  }, []);

  useEffect(() => {
    let active = true;
    const token = sessionStorage.getItem(TOKEN_KEY);

    if (!token) {
      return () => { active = false; };
    }

    authApi.me(token)
      .then((data) => {
        if (active) acceptSession(data);
      })
      .catch(() => {
        if (active) {
          sessionStorage.removeItem(TOKEN_KEY);
          setSession(null);
        }
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => { active = false; };
  }, [acceptSession]);

  if (checking) {
    return (
      <main className="auth-loading" aria-live="polite">
        <span className="auth-brand-mark">T</span>
        <p>Comprobando tu sesión...</p>
      </main>
    );
  }

  if (!session) {
    return <AuthScreen onAuthenticated={acceptSession} />;
  }

  return (
    <App
      authenticatedEmail={session.user.email}
      authenticatedName={session.profile.display_name}
      onLogout={logout}
    />
  );
}
