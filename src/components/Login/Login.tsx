import "../../styles/Auth.css";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

interface LoginData {
  username: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginData>({
    username: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:8088/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const msg = data?.message ?? "Credenciales incorrectas";
        throw new Error(msg);
      }

      const welcomeMatch = data?.message?.match(/Bienvenido\s(.+)$/i);
      const usernameFromResponse = welcomeMatch?.[1] ?? formData.username;

      if (rememberMe) {
        localStorage.setItem("ai-recipes:user", usernameFromResponse);
      } else {
        sessionStorage.setItem("ai-recipes:user", usernameFromResponse);
      }

      setMessage(data?.message ?? "Inicio de sesion exitoso");
      navigate("/home");
    } catch (err: any) {
      setError(err.message ?? "No se pudo iniciar sesion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-main">
          <header>
            <div className="auth-brand">AI Recipes</div>
            <h1 className="auth-title">Iniciar sesión</h1>
            <p className="auth-subtitle">
              Descubre qué puedes cocinar con lo que ya tienes en casa.
            </p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="username">
                Usuario o correo electrónico
              </label>
              <input
                id="username"
                className="auth-input"
                type="text"
                name="username"
                placeholder="ej. maria.garcia"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Ingresa tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: "absolute",
                    right: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            <div className="auth-extra">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                Recuérdame
              </label>
              <a className="auth-link" href="#">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {error && <div className="auth-alert auth-alert--error">{error}</div>}
            {message && (
              <div className="auth-alert auth-alert--success">{message}</div>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="auth-divider">o</div>

          <div className="auth-socials">
            <button type="button" className="auth-social-btn">
              <span className="auth-social-icon">🟦</span>
              Continuar con Google
            </button>
            <button type="button" className="auth-social-btn">
              <span className="auth-social-icon">ⓕ</span>
              Continuar con Facebook
            </button>
          </div>

          <div className="auth-footer">
            ¿Aún no tienes cuenta?{" "}
            <Link className="auth-link" to="/register">
              Regístrate aquí
            </Link>
          </div>
        </div>

        <aside className="auth-illustration">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=520&q=80"
            alt="Receta saludable"
          />
        </aside>
      </div>
    </div>
  );
};
