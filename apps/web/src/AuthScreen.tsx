import { useState, type FormEvent } from "react";
import { Activity, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { authApi, type AuthResponse } from "./authApi";
import "./auth.css";

type Props = {
  onAuthenticated: (data: AuthResponse) => void;
};

export default function AuthScreen({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = mode === "register"
        ? await authApi.register(email, password, displayName)
        : await authApi.login(email, password);

      onAuthenticated(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible completar la solicitud.");
    } finally {
      setLoading(false);
    }
  }

  function changeMode(next: "login" | "register") {
    setMode(next);
    setError("");
    setPassword("");
  }

  return (
    <main className="auth-page">
      <section className="auth-aside">
        <a className="auth-brand" href="#" onClick={(event) => event.preventDefault()}>
          <span className="auth-brand-mark"><Activity size={24} /></span>
          <span><strong>TRAZA</strong><small>Perfil profesional</small></span>
        </a>

        <div className="auth-message">
          <span className="auth-eyebrow">TU CAMINO PROFESIONAL</span>
          <h1>Lo que sabes hacer merece ser demostrado.</h1>
          <p>Organiza tus experiencias, desarrolla tus competencias y construye un portafolio basado en evidencias.</p>
          <div className="auth-points">
            <span><span className="auth-point-check">✓</span> Tu trayectoria en un solo lugar</span>
            <span><span className="auth-point-check">✓</span> Competencias respaldadas por proyectos</span>
            <span><span className="auth-point-check">✓</span> Un perfil que evoluciona contigo</span>
          </div>
        </div>

        <p className="auth-aside-footer">TRAZA · Perfil profesional basado en evidencias</p>
      </section>

      <section className="auth-content">
        <div className="auth-card">
          <div className="auth-mobile-brand">
            <span className="auth-brand-mark"><Activity size={22} /></span>
            <strong>TRAZA</strong>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Acceso a TRAZA">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={mode === "login" ? "auth-tab active" : "auth-tab"}
              onClick={() => changeMode("login")}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              className={mode === "register" ? "auth-tab active" : "auth-tab"}
              onClick={() => changeMode("register")}
            >
              Crear cuenta
            </button>
          </div>

          <h2>{mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}</h2>
          <p className="auth-intro">
            {mode === "login"
              ? "Ingresa para continuar construyendo tu perfil profesional."
              : "Comienza a registrar tus proyectos, competencias y logros."}
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "register" && (
              <label>
                Nombre completo
                <span className="auth-input-wrap">
                  <UserRound size={18} />
                  <input
                    autoComplete="name"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    minLength={2}
                    maxLength={160}
                    placeholder="Tu nombre"
                    required
                  />
                </span>
              </label>
            )}

            <label>
              Correo electrónico
              <span className="auth-input-wrap">
                <Mail size={18} />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  maxLength={320}
                  placeholder="nombre@correo.com"
                  required
                />
              </span>
            </label>

            <label>
              Contraseña
              <span className="auth-input-wrap">
                <LockKeyhole size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={mode === "register" ? 12 : 1}
                  maxLength={128}
                  placeholder={mode === "register" ? "Mínimo 12 caracteres" : "Tu contraseña"}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
              {mode === "register" && (
                <small className="auth-hint">Usa al menos 12 caracteres.</small>
              )}
            </label>

            {error && <div className="auth-error" role="alert">{error}</div>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading
                ? "Procesando..."
                : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-switch">
            {mode === "login" ? "¿Todavía no tienes una cuenta?" : "¿Ya tienes una cuenta?"}
            {" "}
            <button
              type="button"
              onClick={() => changeMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Regístrate" : "Inicia sesión"}
            </button>
          </p>

          <p className="auth-privacy">Tu cuenta y tus datos profesionales deben permanecer bajo tu control.</p>
        </div>
      </section>
    </main>
  );
}
