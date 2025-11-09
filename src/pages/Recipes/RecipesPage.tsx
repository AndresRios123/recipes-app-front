import "../../styles/RecipesList.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { makeApiUrl } from "../../config/api";
import { HomeNavbar } from "../../components/home/HomeNavbar";

type Difficulty = "EASY" | "MEDIUM" | "HARD";

interface RecipeSummary {
  id: number;
  name: string;
  description: string | null;
  difficulty: Difficulty;
  imageUrl: string | null;
  prepTimeMinutes: number | null;
}

const difficultyLabels: Record<Difficulty, string> = {
  EASY: "Fácil",
  MEDIUM: "Medio",
  HARD: "Experto",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80";

export const RecipesPage: React.FC = () => {
  const navigate = useNavigate();
  const storedUsername =
    localStorage.getItem("ai-recipes:user") ?? sessionStorage.getItem("ai-recipes:user");

  const [username, setUsername] = useState<string | undefined>(storedUsername ?? undefined);
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(makeApiUrl("/api/auth/profile"), {
          credentials: "include",
        });
        if (response.ok) {
          const profile = await response.json();
          setUsername(profile.username);
          localStorage.setItem("ai-recipes:user", profile.username);
        }
      } catch {
        // silencio: si falla, mantenemos username almacenado
      }
    };

    const loadRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(makeApiUrl("/api/recipes/me"), {
          credentials: "include",
        });

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("No se pudieron cargar tus recetas");
        }

        const data: RecipeSummary[] = await response.json();
        setRecipes(data);
      } catch (err: any) {
        setError(err.message ?? "No se pudieron cargar tus recetas");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    loadRecipes();
  }, [navigate]);

  const handleLogout = async () => {
    await fetch(makeApiUrl("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);

    localStorage.removeItem("ai-recipes:user");
    sessionStorage.removeItem("ai-recipes:user");
    navigate("/login");
  };

  const handleSelectRecipe = (id: number) => {
    navigate(`/recipes/${id}`);
  };

  return (
    <div className="recipes-page">
      <HomeNavbar username={username} onLogout={handleLogout} />
      <div className="recipes-page__content">
        <header className="recipes-page__header">
          <div>
            <p className="recipes-page__eyebrow">Tus creaciones</p>
            <h1>Mis recetas guardadas</h1>
            <p>Consulta y abre cualquiera de tus recetas para ver el detalle completo.</p>
          </div>
          <button className="recipes-page__new" type="button" onClick={() => navigate("/pantry")}>
            Crear nueva receta
          </button>
        </header>

        {loading && <div className="recipes-page__status">Cargando tus recetas...</div>}
        {error && <div className="recipes-page__status recipes-page__status--error">{error}</div>}

        {!loading && !error && recipes.length === 0 && (
          <div className="recipes-page__status">Todavía no has guardado recetas.</div>
        )}

        {!loading && !error && recipes.length > 0 && (
          <div className="recipes-page__grid">
            {recipes.map((recipe) => (
              <article
                key={recipe.id}
                className="recipes-card"
                onClick={() => handleSelectRecipe(recipe.id)}
              >
                <img
                  src={recipe.imageUrl ?? FALLBACK_IMAGE}
                  alt={recipe.name}
                  className="recipes-card__image"
                />
                <div className="recipes-card__body">
                  <p className="recipes-card__meta">
                    {recipe.prepTimeMinutes
                      ? `${recipe.prepTimeMinutes} min · `
                      : ""}
                    {difficultyLabels[recipe.difficulty]}
                  </p>
                  <h3>{recipe.name}</h3>
                  {recipe.description && <p className="recipes-card__description">{recipe.description}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
