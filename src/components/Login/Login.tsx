import React, { useState } from "react";

interface LoginData {
    username: string;
    password: string;
}

export const LoginForm: React.FC = () => {
    const [formData, setFormData] = useState<LoginData>({
        username: "",
        password: "",
    });

    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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
                const message = data?.message ?? "Credenciales incorrectas";
                throw new Error(message);
            }

            setMessage(data?.message ?? "Inicio de sesion exitoso");
        } catch (err: any) {
            setError(err.message ?? "No se pudo iniciar sesion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Iniciar Sesion</h2>

            <div>
                <label>Usuario:</label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                />
            </div>

            <div>
                <label>Contrasena:</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                />
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {message && <p style={{ color: "green" }}>{message}</p>}

            <button type="submit" disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar"}
            </button>
        </form>
    );
};