import "../../styles/Auth.css";
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { makeApiUrl } from "../../config/api";

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

  // Si ya hay una sesion activa, evita mostrar el login y redirige al home.
  useEffect(() => {
    const storedUser = localStorage.getItem("ai-recipes:user") ?? sessionStorage.getItem("ai-recipes:user");
    if (storedUser) {
      navigate("/home", { replace: true });
      return;
    }

    // Verifica contra el backend por si hay cookie de sesion.
    const controller = new AbortController();
    fetch(makeApiUrl("/api/auth/profile"), {
      credentials: "include",
      signal: controller.signal,
    })
      .then((res) => {
        if (res.ok) {
          navigate("/home", { replace: true });
        }
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [navigate]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(makeApiUrl("/api/auth/login"), {
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
      navigate("/home", { replace: true });
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
            <h1 className="auth-title">Iniciar sesion</h1>
            <p className="auth-subtitle">
              Descubre que puedes cocinar con lo que ya tienes en casa.
            </p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="username">
                Usuario o correo electronico
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
                Contrasena
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Ingresa tu contrasena"
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
                Recuerdame
              </label>
              <a className="auth-link" href="#">
                Olvidaste tu contrasena?
              </a>
            </div>

            {error && <div className="auth-alert auth-alert--error">{error}</div>}
            {message && (
              <div className="auth-alert auth-alert--success">{message}</div>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesion"}
            </button>
          </form>

          <div className="auth-divider">o</div>

          <div className="auth-socials">
            <button type="button" className="auth-social-btn">
              <span className="auth-social-icon">G</span>
              Continuar con Google
            </button>
            <button type="button" className="auth-social-btn">
              <span className="auth-social-icon">f</span>
              Continuar con Facebook
            </button>
          </div>

          <div className="auth-footer">
            Aun no tienes cuenta?{" "}
            <Link className="auth-link" to="/register">
              Registrate aqui
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
