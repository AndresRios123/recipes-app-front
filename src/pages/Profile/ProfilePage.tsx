import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HomeNavbar } from "../../components/home/HomeNavbar";
import { makeApiUrl } from "../../config/api";
import "../../styles/Auth.css";

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formValues, setFormValues] = useState({ username: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadProfile = async () => {
      try {
        const res = await fetch(makeApiUrl("/api/auth/profile"), {
          credentials: "include",
          signal: controller.signal,
        });
        if (res.status === 401) {
          navigate("/login");
          return;
        }
        if (!res.ok) {
          throw new Error("No se pudo cargar tu perfil");
        }
        const data: UserProfile = await res.json();
        setProfile(data);
        setFormValues({ username: data.username, email: data.email });
        sessionStorage.setItem("ai-recipes:user", data.username);
        localStorage.setItem("ai-recipes:user", data.username);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message ?? "No se pudo cargar tu perfil");
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
    return () => controller.abort();
  }, [navigate]);

  const handleLogout = async () => {
    await fetch(makeApiUrl("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);
    sessionStorage.removeItem("ai-recipes:user");
    localStorage.removeItem("ai-recipes:user");
    navigate("/login");
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setSavingProfile(true);
    setProfileMessage(null);
    setError(null);
    try {
      const res = await fetch(makeApiUrl(`/api/users/${profile.id}`), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formValues.username.trim(),
          email: formValues.email.trim(),
        }),
      });
      const payload = await res.json().catch(() => null);
      if (res.status === 401) {
        navigate("/login");
        return;
      }
      if (!res.ok) {
        throw new Error(payload?.message ?? "No se pudo actualizar el perfil");
      }
      const updated = payload ?? { ...profile, ...formValues };
      setProfile((prev) => (prev ? { ...prev, ...formValues } : updated));
      setProfileMessage(payload?.message ?? "Perfil actualizado correctamente");
    } catch (err: any) {
      setError(err.message ?? "No se pudo actualizar el perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordMessage(null);
    setError(null);
    try {
      const res = await fetch(makeApiUrl("/api/auth/change-password"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const payload = await res.json().catch(() => null);
      if (res.status === 401) {
        navigate("/login");
        return;
      }
      if (!res.ok) {
        throw new Error(payload?.message ?? "No se pudo cambiar la contraseña");
      }
      setPasswordMessage(payload?.message ?? "Contraseña actualizada");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err: any) {
      setError(err.message ?? "No se pudo cambiar la contraseña");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="profile-page">
      <HomeNavbar username={profile?.username} onLogout={handleLogout} />

      <div className="profile-wrapper">
        <header className="profile-header">
          <div>
            <p className="profile-kicker">Tu cuenta</p>
            <h1>Perfil de usuario</h1>
            <p className="profile-subtitle">
              Actualiza tu información básica o cambia la contraseña de tu cuenta.
            </p>
          </div>
        </header>

        {loading && <div className="auth-alert">Cargando perfil...</div>}
        {error && <div className="auth-alert auth-alert--error">{error}</div>}

        {!loading && !error && profile && (
          <div className="profile-grid">
            <section className="profile-card">
              <h2>Datos de la cuenta</h2>
              <form className="auth-form" onSubmit={handleProfileSubmit}>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="profile-username">
                    Nombre de usuario
                  </label>
                  <input
                    id="profile-username"
                    className="auth-input"
                    type="text"
                    value={formValues.username}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, username: e.target.value }))}
                    minLength={3}
                    maxLength={50}
                    required
                  />
                </div>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="profile-email">
                    Correo electrónico
                  </label>
                  <input
                    id="profile-email"
                    className="auth-input"
                    type="email"
                    value={formValues.email}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                {profileMessage && (
                  <div className="auth-alert auth-alert--success">{profileMessage}</div>
                )}
                <button className="auth-submit" type="submit" disabled={savingProfile}>
                  {savingProfile ? "Guardando..." : "Guardar cambios"}
                </button>
              </form>
            </section>

            <section className="profile-card">
              <h2>Cambiar contraseña</h2>
              <form className="auth-form" onSubmit={handlePasswordSubmit}>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="current-password">
                    Contraseña actual
                  </label>
                  <input
                    id="current-password"
                    className="auth-input"
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) =>
                      setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="new-password">
                    Nueva contraseña
                  </label>
                  <input
                    id="new-password"
                    className="auth-input"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
                    minLength={6}
                    required
                  />
                </div>
                {passwordMessage && (
                  <div className="auth-alert auth-alert--success">{passwordMessage}</div>
                )}
                <button className="auth-submit" type="submit" disabled={savingPassword}>
                  {savingPassword ? "Actualizando..." : "Actualizar contraseña"}
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
