import "../../styles/Home.css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { makeApiUrl } from "../../config/api";
import { HomeNavbar } from "../../components/home/HomeNavbar";
import { HomeHero } from "../../components/home/HomeHero";
import { HomeSearchBar } from "../../components/home/HomeSearchBar";
import { HomeRecommendations } from "../../components/home/HomeRecommendations";
import { HomeCategories } from "../../components/home/HomeCategories";
import { HomeHowItWorks } from "../../components/home/HomeHowItWorks";
import type {
  CategoryHighlight,
  HowItWorksStep,
  RecommendedRecipe,
} from "../../types/home";

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

interface RecipeApiResponse {
  id: number;
  name: string;
  description: string;
  instructions: string;
  prepTimeMinutes: number | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  imageUrl: string | null;
}

const difficultyMap: Record<RecipeApiResponse["difficulty"], RecommendedRecipe["difficulty"]> = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=640&q=80";

/**
 * Pagina principal Home. Coordina datos remotos y eventos de UI.
 */
export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const storedUsername =
    localStorage.getItem("ai-recipes:user") ?? sessionStorage.getItem("ai-recipes:user");

  const [profile, setProfile] = useState<UserProfile | null>(
    storedUsername ? { id: 0, username: storedUsername, email: "" } : null
  );
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [recommendedRecipes, setRecommendedRecipes] = useState<RecommendedRecipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [recipesError, setRecipesError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");

  const categoryHighlights: CategoryHighlight[] = useMemo(
    () => [
      { name: "Postres", icon: "POST" },
      { name: "Platos rapidos", icon: "RAP" },
      { name: "Saludables", icon: "SAL" },
      { name: "Veganos", icon: "VEG" },
      { name: "Desayunos", icon: "DES" },
    ],
    []
  );

  const howItWorks: HowItWorksStep[] = useMemo(
    () => [
      {
        title: "Escribe tus ingredientes",
        description: "Agrega lo que tienes en la despensa y tu refrigerador.",
        gradient: "linear-gradient(135deg, #f97316, #fb923c)",
      },
      {
        title: "Recibe recetas posibles",
        description: "Nuestra IA calcula las mejores opciones para ti.",
        gradient: "linear-gradient(135deg, #2563eb, #1d4ed8)",
      },
      {
        title: "Cocina y guarda favoritas",
        description: "Sigue los pasos, marca favoritas y crea tu historial.",
        gradient: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
      },
    ],
    []
  );

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const response = await fetch(makeApiUrl("/api/auth/profile"), {
        credentials: "include",
      });

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("No se pudo obtener el perfil");
      }

      const data: UserProfile = await response.json();
      setProfile(data);
      localStorage.setItem("ai-recipes:user", data.username);
    } catch (err: any) {
      setProfileError(err.message ?? "No se pudo obtener el perfil");
    } finally {
      setProfileLoading(false);
    }
  }, [navigate]);

  const loadRecommended = useCallback(async () => {
    setRecipesLoading(true);
    try {
      const response = await fetch(makeApiUrl("/api/recipes"), {
        credentials: "include",
      });

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("No se pudieron cargar las recetas");
      }

      const data: RecipeApiResponse[] = await response.json();
      const mapped: RecommendedRecipe[] = data.slice(0, 6).map((recipe) => ({
        id: recipe.id,
        title: recipe.name,
        difficulty: difficultyMap[recipe.difficulty] ?? "easy",
        time: recipe.prepTimeMinutes ? `${recipe.prepTimeMinutes} min` : "Tiempo variable",
        image: recipe.imageUrl ?? FALLBACK_IMAGE,
      }));
      setRecommendedRecipes(mapped);
    } catch (err: any) {
      setRecipesError(err.message ?? "No se pudieron cargar las recetas");
    } finally {
      setRecipesLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadProfile();
    loadRecommended();
  }, [loadProfile, loadRecommended]);

  const handleLogout = useCallback(async () => {
    await fetch(makeApiUrl("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);

    localStorage.removeItem("ai-recipes:user");
    sessionStorage.removeItem("ai-recipes:user");
    navigate("/login");
  }, [navigate]);

  const handleSearchSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    // TODO: integrar la busqueda real en el backend.
  }, []);

  const handleAddIngredients = useCallback(() => {
    navigate("/pantry");
  }, [navigate]);

  const handleSelectRecipe = useCallback(
    (recipeId: number) => {
      navigate(`/recipes/${recipeId}`);
    },
    [navigate]
  );

  const isLoading = profileLoading || recipesLoading;
  const errorMessage = profileError ?? recipesError;

  return (
    <div className="home-page">
      <HomeNavbar username={profile?.username} onLogout={handleLogout} />

      {isLoading && <div className="home-loader">Cargando tu experiencia...</div>}
      {errorMessage && <div className="home-error">{errorMessage}</div>}

      {!isLoading && !errorMessage && (
        <>
          <HomeHero username={profile?.username} onAddIngredients={handleAddIngredients} />

          <HomeSearchBar
            search={search}
            category={categoryFilter}
            onSearchChange={setSearch}
            onCategoryChange={setCategoryFilter}
            onSubmit={handleSearchSubmit}
          />

          <HomeRecommendations recipes={recommendedRecipes} onSelect={handleSelectRecipe} />
          <HomeCategories categories={categoryHighlights} />
          <HomeHowItWorks steps={howItWorks} />
        </>
      )}
    </div>
  );
};

