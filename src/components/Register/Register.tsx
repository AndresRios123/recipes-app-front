import React, {useState} from "react";
import { useNavigate } from "react-router-dom";

interface RegisterData{
    username: string,
    password: string,
    email: string,
}

export const RegisterForm: React.FC = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState<RegisterData>({
        username: "",
        password: "",
        email: "",
    })

    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
        setFormData({
            ...formData,
            [e.target.name] : e.target.value,
        })
    }

    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const response = await fetch("http://localhost:8088/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const message = data?.message ?? "Datos invalidos";
                throw new Error(message);
            }

            setMessage(data?.message ?? "Usuario registrado exitosamente");
            setFormData({
                username: "",
                email:"",
                password: ""
            })
            setTimeout(() => navigate('/login'), 1500)
            
         } catch (err: any) {
            setError(err.message ?? "No se pudo registrar al usuario");
        } finally {
            setLoading(false);
        }
    }

    return(<div>
        <form onSubmit={handleSubmit}>
            <h2>Registrarse</h2>

            <div>
                <label>Usuario:</label>
                <input 
                type="text" 
                name="username" 
                value={formData.username}
                onChange={handleChange}
                required
                />
            </div>
            
            <div>
                <label>Email:</label>
                <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required 
                />
            </div>
            
            <div>
                <label>Contraseña:</label>
                <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                />
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {message && <p style={{ color: "green" }}>{message}</p>}

            <button type="submit" disabled={loading}>
                {loading ? "Cargando..." : "Registrate"}
            </button>

        </form>
    
    </div>)

}