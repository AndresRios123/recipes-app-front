import "../../styles/RecipeDetail.css";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { makeApiUrl } from "../../config/api";
import { HomeNavbar } from "../../components/home/HomeNavbar";
import type { RecipeDetail } from "../../types/recipes";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=960&q=80";

const difficultyLabels: Record<RecipeDetail["difficulty"], string> = {
  EASY: "Facil",
  MEDIUM: "Medio",
  HARD: "Experto",
};

export const RecipeDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const storedUsername =
    localStorage.getItem("ai-recipes:user") ?? sessionStorage.getItem("ai-recipes:user");

  const [username, setUsername] = useState<string | undefined>(storedUsername ?? undefined);
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecipe = async () => {
      if (!id) {
        setError("Receta no encontrada");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(makeApiUrl(`/api/recipes/${id}`), {
          credentials: "include",
        });

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("No se pudo cargar la receta");
        }

        const data: RecipeDetail = await response.json();
        setRecipe(data);
      } catch (err: any) {
        setError(err.message ?? "No se pudo cargar la receta");
      } finally {
        setLoading(false);
      }
    };

    const loadProfileName = async () => {
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
        // opcional, ignoramos error
      }
    };

    loadProfileName();
    loadRecipe();
  }, [id, navigate]);

  const metaInfo = useMemo(() => {
    if (!recipe) {
      return [] as string[];
    }
    const info: string[] = [];
    if (recipe.prepTimeMinutes) {
      info.push(`Tiempo: ${recipe.prepTimeMinutes} min`);
    }
    info.push(`Dificultad: ${difficultyLabels[recipe.difficulty] ?? recipe.difficulty}`);
    return info;
  }, [recipe]);

  const handleLogout = async () => {
    await fetch(makeApiUrl("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);

    localStorage.removeItem("ai-recipes:user");
    sessionStorage.removeItem("ai-recipes:user");
    navigate("/login");
  };

  return (
    <div className="recipe-detail-page">
      <HomeNavbar username={username} onLogout={handleLogout} />

      <div className="recipe-detail-content">
        <button className="recipe-detail-back" type="button" onClick={() => navigate(-1)}>
          Volver
        </button>

        {loading && <div className="pantry-loader">Cargando receta...</div>}
        {error && <div className="pantry-error">{error}</div>}

        {!loading && !error && recipe && (
          <>
            <header className="recipe-detail-header">
              <h1 className="recipe-detail-title">{recipe.name}</h1>
              {recipe.description && <p>{recipe.description}</p>}
              {metaInfo.length > 0 && (
                <div className="recipe-detail-meta">
                  {metaInfo.map((info) => (
                    <span key={info}>{info}</span>
                  ))}
                </div>
              )}
              <img
                className="recipe-detail-image"
                src={recipe.imageUrl ?? FALLBACK_IMAGE}
                alt={recipe.name}
              />
            </header>

            <section className="recipe-detail-section">
              <h2>Ingredientes necesarios</h2>
              <ul className="recipe-detail-ingredients">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient.ingredientId}>
                    {ingredient.quantity} {ingredient.unit} de {ingredient.ingredientName}
                    {ingredient.notes ? ` - ${ingredient.notes}` : ""}
                  </li>
                ))}
              </ul>
            </section>

            <section className="recipe-detail-section">
              <h2>Pasos de preparacion</h2>
              <div className="recipe-detail-instructions">{recipe.instructions}</div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};
