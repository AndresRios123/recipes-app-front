import "../../styles/Pantry.css";
import { makeApiUrl } from "../../config/api";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HomeNavbar } from "../../components/home/HomeNavbar";
import { PantryForm } from "../../components/pantry/PantryForm";
import { PantryList } from "../../components/pantry/PantryList";
import { PantryAIBanner } from "../../components/pantry/PantryAIBanner";
import { PantryRecommendations } from "../../components/pantry/PantryRecommendations";
import type {
  IngredientOption,
  PantryFormValues,
  PantryItem,
  Recommendation,
} from "../../types/pantry";
import { useRecommendationStore } from "../../context/RecommendationContext";

const MAX_TITLE_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_INSTRUCTIONS_LENGTH = 60000;

const sanitizeText = (text: string | null | undefined, maxLength: number | null = null): string | null => {
  if (!text) {
    return null;
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (maxLength !== null && trimmed.length > maxLength) {
    return trimmed.slice(0, maxLength);
  }
  return trimmed;
};

const EMPTY_FORM: PantryFormValues = {
  ingredientId: null,
  ingredientName: "",
  quantity: 0,
  unit: "",
  categoryId: null,
};

/**
 * Pagina para gestionar la despensa virtual del usuario y solicitar recetas a la IA.
 */
export const PantryPage: React.FC = () => {
  const navigate = useNavigate();
  const storedUsername =
    localStorage.getItem("ai-recipes:user") ?? sessionStorage.getItem("ai-recipes:user");
  const [profileName, setProfileName] = useState<string | undefined>(storedUsername ?? undefined);
  const [items, setItems] = useState<PantryItem[]>([]);
  const [ingredients, setIngredients] = useState<IngredientOption[]>([]);
  const [formValues, setFormValues] = useState<PantryFormValues>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [pantryError, setPantryError] = useState<string | null>(null);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const { recommendations, setRecommendations, updateRecommendation } = useRecommendationStore();

  const sortedItems = useMemo(
    () => items.slice().sort((a, b) => a.ingredientName.localeCompare(b.ingredientName)),
    [items]
  );

  const loadRecommendations = useCallback(async () => {
    setLoadingRecommendations(true);
    setRecommendationsError(null);
    try {
      const response = await fetch(makeApiUrl("/api/recommendations"), {
        credentials: "include",
      });

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("No se pudieron obtener las recomendaciones");
      }

      const data: Recommendation[] = await response.json();
      const timestamp = Date.now();
      const withCacheIds = data.map((recommendation, index) => ({
        ...recommendation,
        cacheId:
          recommendation.cacheId
          ?? (recommendation.recipeId !== null
            ? `stored-${recommendation.recipeId}`
            : `ai-${timestamp}-${index}`),
      }));
      setRecommendations(withCacheIds);
    } catch (err: any) {
      setRecommendationsError(err.message ?? "No se pudieron obtener las recomendaciones");
    } finally {
      setLoadingRecommendations(false);
    }
  }, [navigate]);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setPantryError(null);
    try {
      const [profileRes, pantryRes, ingredientsRes] = await Promise.all([
        fetch(makeApiUrl("/api/auth/profile"), { credentials: "include" }),
        fetch(makeApiUrl("/api/pantry"), { credentials: "include" }),
        fetch(makeApiUrl("/api/ingredients"), { credentials: "include" }),
      ]);

      if (profileRes.status === 401) {
        navigate("/login");
        return;
      }

      if (!profileRes.ok || !pantryRes.ok || !ingredientsRes.ok) {
        throw new Error("No se pudieron cargar los datos iniciales");
      }

      const profileData = await profileRes.json();
      setProfileName(profileData.username);

      const pantryData: PantryItem[] = await pantryRes.json();
      setItems(pantryData);

      const ingredientsData = await ingredientsRes.json();
      const options: IngredientOption[] = ingredientsData.map((ingredient: any) => ({
        id: ingredient.id,
        name: ingredient.name ?? ingredient.ingredientName ?? "Ingrediente",
        categoryName: ingredient.category?.name ?? ingredient.category?.categoryName ?? "General",
      }));
      setIngredients(options);
    } catch (err: any) {
      setPantryError(err.message ?? "Ocurrio un error al consultar la despensa");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleLogout = useCallback(async () => {
    await fetch(makeApiUrl("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);

    localStorage.removeItem("ai-recipes:user");
    sessionStorage.removeItem("ai-recipes:user");
    navigate("/login");
  }, [navigate]);

  const resetForm = useCallback(() => setFormValues(EMPTY_FORM), []);

  const handleSubmit = useCallback(
    async (values: PantryFormValues) => {
      setProcessing(true);
      setPantryError(null);
      try {
        const response = await fetch(makeApiUrl("/api/pantry"), {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ingredientId: values.ingredientId,
            ingredientName: values.ingredientName,
            categoryId: values.categoryId,
            quantity: values.quantity,
            unit: values.unit,
          }),
        });

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.message ?? "No se pudo guardar el ingrediente");
        }

        const saved: PantryItem = await response.json();
        setItems((prev) => {
          const filtered = prev.filter((item) => item.ingredientId !== saved.ingredientId);
          return [...filtered, saved];
        });
        resetForm();
        await loadRecommendations();
      } catch (err: any) {
        setPantryError(err.message ?? "No se pudo guardar el ingrediente");
      } finally {
        setProcessing(false);
      }
    },
    [loadRecommendations, navigate, resetForm]
  );

  const handleDelete = useCallback(
    async (ingredientId: number) => {
      setProcessing(true);
      setPantryError(null);
      try {
        const response = await fetch(makeApiUrl(`/api/pantry/${ingredientId}`), {
          method: "DELETE",
          credentials: "include",
        });

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.message ?? "No se pudo eliminar el ingrediente");
        }

        setItems((prev) => prev.filter((item) => item.ingredientId !== ingredientId));
        resetForm();
        await loadRecommendations();
      } catch (err: any) {
        setPantryError(err.message ?? "No se pudo eliminar el ingrediente");
      } finally {
        setProcessing(false);
      }
    },
    [loadRecommendations, navigate, resetForm]
  );

  const handleSelectItem = useCallback((item: PantryItem) => {
    setFormValues({
      ingredientId: item.ingredientId,
      ingredientName: item.ingredientName,
      quantity: item.quantity,
      unit: item.unit,
      categoryId: item.category.id,
    });
  }, []);

  const handleSaveRecommendation = useCallback(
    async (recommendation: Recommendation) => {
      setRecommendationsError(null);
      try {
        const sanitizedIngredients =
          recommendation.ingredients
            ?.filter((ingredient) => ingredient.name && ingredient.name.trim().length > 0)
            .map((ingredient) => ({
              name: ingredient.name.trim(),
              quantity: ingredient.quantity,
              unit: sanitizeText(ingredient.unit, 50),
            })) ?? [];

        const difficulty = recommendation.difficulty
          ? recommendation.difficulty.trim().toUpperCase()
          : null;

        const payload = {
          recipeId: recommendation.recipeId,
          title: sanitizeText(recommendation.title, MAX_TITLE_LENGTH) ?? "Receta sugerida",
          description: sanitizeText(recommendation.description, MAX_DESCRIPTION_LENGTH),
          instructions:
            sanitizeText(recommendation.instructions, MAX_INSTRUCTIONS_LENGTH) ??
            "Instrucciones no disponibles. Sigue tu intuicion culinaria para completar la receta.",
          prepTimeMinutes: recommendation.prepTimeMinutes ?? null,
          difficulty,
          imageUrl: recommendation.imageUrl ?? null,
          ingredients: sanitizedIngredients,
        };

        const response = await fetch(makeApiUrl("/api/recommendations/save"), {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.message ?? "No se pudo guardar la receta sugerida");
        }

        const savedRecipe = await response.json();
        if (recommendation.cacheId) {
          const mappedIngredients =
            savedRecipe.ingredients?.map((ingredient: any) => ({
              name: ingredient.ingredientName,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
            })) ?? recommendation.ingredients ?? [];

          updateRecommendation(recommendation.cacheId, (current) => ({
            ...current,
            recipeId: savedRecipe.id ?? current.recipeId,
            description: savedRecipe.description ?? current.description,
            instructions: savedRecipe.instructions ?? current.instructions,
            prepTimeMinutes: savedRecipe.prepTimeMinutes ?? current.prepTimeMinutes,
            difficulty: savedRecipe.difficulty ?? current.difficulty,
            imageUrl: savedRecipe.imageUrl ?? current.imageUrl,
            ingredients: mappedIngredients,
          }));
        } else {
          await loadRecommendations();
        }
        navigate(`/recipes/${savedRecipe.id}`);
      } catch (err: any) {
        setRecommendationsError(err.message ?? "No se pudo guardar la receta sugerida");
      }
    },
    [loadRecommendations, navigate, updateRecommendation]
  );

  const handleRequestAI = useCallback(() => {
    loadRecommendations().catch(() => undefined);
  }, [loadRecommendations]);

  const handleRecommendationSelect = useCallback(
    (recommendation: Recommendation) => {
      if (recommendation.recipeId !== null) {
        navigate(`/recipes/${recommendation.recipeId}`);
      }
    },
    [navigate]
  );

  return (
    <div className="pantry-page">
      <HomeNavbar username={profileName} onLogout={handleLogout} />

      <main className="pantry-content">
        <header className="pantry-header">
          <button className="pantry-header__back" type="button" onClick={() => navigate(-1)}>
            &larr; Volver
          </button>
          <h1>Mi despensa</h1>
          <p>Organiza tus ingredientes para que la IA pueda sugerirte recetas a medida.</p>
        </header>

        {loading ? (
          <div className="pantry-loader">Cargando tu despensa...</div>
        ) : (
          <div className="pantry-grid">
            <PantryForm
              ingredients={ingredients}
              initialValues={formValues}
              onSubmit={handleSubmit}
              onReset={resetForm}
              isSaving={processing}
            />

            <section className="pantry-list-wrapper">
              <h2 className="pantry-section-title">Ingredientes guardados</h2>
              {pantryError && <div className="pantry-error">{pantryError}</div>}
              <PantryList
                items={sortedItems}
                onSelect={handleSelectItem}
                onDelete={handleDelete}
                isProcessing={processing}
              />
            </section>
          </div>
        )}

        <PantryRecommendations
          recommendations={recommendations}
          isLoading={loadingRecommendations}
          error={recommendationsError}
          onSelect={handleRecommendationSelect}
          onSave={handleSaveRecommendation}
        />

        <PantryAIBanner onRequestRecipes={handleRequestAI} />
      </main>
    </div>
  );
};
