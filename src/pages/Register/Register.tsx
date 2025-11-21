import "../../styles/Auth.css";
import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { makeApiUrl } from "../../config/api";

interface RegisterData {
  username: string;
  password: string;
  email: string;
}

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterData>({
    username: "",
    password: "",
    email: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
      const response = await fetch(makeApiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const msg = data?.message ?? "Datos invalidos";
        throw new Error(msg);
      }

      setMessage(data?.message ?? "Usuario registrado exitosamente");
      setFormData({
        username: "",
        password: "",
        email: "",
      });

      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setError(err.message ?? "No se pudo registrar al usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <aside className="auth-illustration">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=520&q=80"
            alt="Receta creativa"
          />
        </aside>

        <div className="auth-main">
          <header>
            <div className="auth-brand">Saborify</div>
            <h1 className="auth-title">Crear cuenta</h1>
            <p className="auth-subtitle">
              Personaliza tu despensa virtual y recibe recomendaciones inteligentes.
            </p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="username">
                Nombre de usuario
              </label>
              <input
                id="username"
                className="auth-input"
                type="text"
                name="username"
                placeholder="ej. chef.ana"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                required
                minLength={3}
                maxLength={50}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                className="auth-input"
                type="email"
                name="email"
                placeholder="tucorreo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
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
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  style={{
                    position: "absolute",
                    right: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                  }}
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
            </div>

            {error && <div className="auth-alert auth-alert--error">{error}</div>}
            {message && (
              <div className="auth-alert auth-alert--success">{message}</div>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <div className="auth-footer">
            ¿Ya tienes cuenta?{" "}
            <Link className="auth-link" to="/login">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
