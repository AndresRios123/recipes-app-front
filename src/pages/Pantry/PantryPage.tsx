import "../../styles/Pantry.css";
import { makeApiUrl } from "../../config/api";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HomeNavbar } from "../../components/home/HomeNavbar";
import { PantryForm } from "../../components/pantry/PantryForm";
import { PantryList } from "../../components/pantry/PantryList";
import { PantryRecommendations } from "../../components/pantry/PantryRecommendations";
import type {
  IngredientOption,
  PantryFormValues,
  PantryItem,
  Recommendation,
  RecommendationJobResponse,
} from "../../types/pantry";
import { useRecommendationStore } from "../../context/RecommendationContext";
import { Queue, Stack, SinglyLinkedList } from "../../utils/dataStructures";

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

  const PENDING_RECS_KEY = "ai-recipes:pending-recs";
  const PENDING_JOB_KEY = "ai-recipes:pending-job";
  const JOB_QUEUE_KEY = "ai-recipes:job-queue";
  const HISTORY_STORAGE_KEY = "ai-recipes:history-list";
  const RECOMMENDATIONS_KEY = "ai-recipes:recommendations";
  const HISTORY_LIMIT = 25;
  const HISTORY_ENTRIES_LIMIT = 10;

  const pollRef = useRef<number | null>(null);
  const jobQueueRef = useRef(new Queue<string>());
  const processingJobRef = useRef<string | null>(null);
  const historyRef = useRef(new Stack<PantryItem[]>());
  const historyListRef = useRef(
    new SinglyLinkedList<{
      id: string;
      createdAt: number;
      items: Recommendation[];
    }>()
  );

  const sortedItems = useMemo(
    () => items.slice().sort((a, b) => a.ingredientName.localeCompare(b.ingredientName)),
    [items]
  );

  const copyPantry = (list: PantryItem[]): PantryItem[] =>
    list.map((item) => ({
      ...item,
      category: { ...item.category },
    }));

  const resetForm = useCallback(() => setFormValues(EMPTY_FORM), []);

  const pushHistory = (snapshot: PantryItem[]) => {
    historyRef.current.push(copyPantry(snapshot));
    // Mantiene la pila acotada para no consumir demasiada memoria.
    while (historyRef.current.size() > HISTORY_LIMIT) {
      historyRef.current.pop();
    }
  };

  const clearUserScopedCaches = (currentUser: string | undefined) => {
    localStorage.removeItem(RECOMMENDATIONS_KEY);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    localStorage.removeItem(PENDING_JOB_KEY);
    localStorage.removeItem(PENDING_RECS_KEY);
    localStorage.removeItem(JOB_QUEUE_KEY);
    sessionStorage.removeItem(PENDING_RECS_KEY);
    historyListRef.current.clear();
    historyRef.current = new Stack<PantryItem[]>();
    jobQueueRef.current = new Queue<string>();
    processingJobRef.current = null;
    setRecommendations([]);
    if (currentUser) {
      localStorage.setItem("ai-recipes:user", currentUser);
      sessionStorage.setItem("ai-recipes:user", currentUser);
    }
  };

  const persistHistoryEntries = () => {
    const arr = historyListRef.current.toArray();
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(arr));
  };

  const hydrateHistory = () => {
    historyListRef.current.clear();
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Array<{
        id: string;
        createdAt: number;
        items: Recommendation[];
      }>;
      parsed.forEach((entry) => historyListRef.current.append(entry));
    } catch {
      /* ignore */
    }
  };

  const pushHistoryEntry = (items: Recommendation[]) => {
    if (!items || items.length === 0) {
      return;
    }
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `hist-${Date.now()}`;
    const entry = {
      id,
      createdAt: Date.now(),
      items,
    };
    historyListRef.current.append(entry);
    while (historyListRef.current.size() > HISTORY_ENTRIES_LIMIT) {
      historyListRef.current.removeAt(0);
    }
    try {
      persistHistoryEntries();
    } catch {
      /* ignore storage errors */
    }
  };

  const handleUndo = useCallback(() => {
    const previous = historyRef.current.pop();
    if (!previous) {
      return;
    }
    setPantryError(null);
    setItems(previous);
    resetForm();
  }, [resetForm]);

  const stopPolling = () => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const persistQueue = () => {
    const array = jobQueueRef.current.toArray();
    if (array.length === 0) {
      localStorage.removeItem(JOB_QUEUE_KEY);
    } else {
      localStorage.setItem(JOB_QUEUE_KEY, JSON.stringify(array));
    }
  };

  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(makeApiUrl(`/api/recommendations/jobs/${jobId}`), {
        credentials: "include",
        keepalive: true,
      });
      if (res.status === 401) {
        navigate("/login");
        return;
      }
      if (res.status === 404) {
        stopPolling();
        localStorage.removeItem(PENDING_JOB_KEY);
        processingJobRef.current = null;
        persistQueue();
        return;
      }
      const payload = (await res.json()) as RecommendationJobResponse;
      if (payload.status === "DONE" && payload.recommendations) {
        const timestamp = Date.now();
        const normalized: Recommendation[] = [];
        for (let i = 0; i < payload.recommendations.length; i++) {
          const rec = payload.recommendations[i];
          const cacheId = rec.cacheId
            ? rec.cacheId
            : rec.recipeId !== null
              ? `stored-${rec.recipeId}`
              : `ai-${timestamp}-${i}`;
          normalized.push({ ...rec, cacheId });
        }
        setRecommendations(normalized);
        pushHistoryEntry(normalized);
        stopPolling();
        localStorage.removeItem(PENDING_JOB_KEY);
        sessionStorage.removeItem(PENDING_RECS_KEY);
        processingJobRef.current = null;
        persistQueue();
      } else if (payload.status === "ERROR") {
        setRecommendationsError(payload.errorMessage ?? "No se pudieron obtener las recomendaciones");
        stopPolling();
        localStorage.removeItem(PENDING_JOB_KEY);
        sessionStorage.removeItem(PENDING_RECS_KEY);
        processingJobRef.current = null;
        persistQueue();
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return;
      }
      setRecommendationsError(err.message ?? "No se pudieron obtener las recomendaciones");
      stopPolling();
      localStorage.removeItem(PENDING_JOB_KEY);
      sessionStorage.removeItem(PENDING_RECS_KEY);
      processingJobRef.current = null;
      persistQueue();
    } finally {
      setLoadingRecommendations(false);
    }
  }, [navigate, setRecommendations, PENDING_RECS_KEY, PENDING_JOB_KEY]);

  const startPolling = useCallback((jobId: string) => {
    processingJobRef.current = jobId;
    localStorage.setItem(PENDING_JOB_KEY, jobId);
    sessionStorage.setItem(PENDING_RECS_KEY, "true");
    setLoadingRecommendations(true);
    setRecommendationsError(null);
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
    }
    pollRef.current = window.setInterval(() => {
      pollJobStatus(jobId).catch(() => undefined);
    }, 2500);
  }, [pollJobStatus, PENDING_RECS_KEY, PENDING_JOB_KEY]);

  const processNextJob = useCallback(() => {
    if (processingJobRef.current) {
      return;
    }
    const nextId = jobQueueRef.current.dequeue();
    persistQueue();
    if (!nextId) {
      return;
    }
    startPolling(nextId);
  }, [startPolling]);

  const requestRecommendationsJob = useCallback(async () => {
    setRecommendationsError(null);
    sessionStorage.setItem(PENDING_RECS_KEY, "true");
    try {
      const res = await fetch(makeApiUrl("/api/recommendations/jobs"), {
        method: "POST",
        credentials: "include",
        keepalive: true,
      });
      if (res.status === 401) {
        navigate("/login");
        return;
      }
      if (!res.ok) {
        throw new Error("No se pudo iniciar la generación de recetas");
      }
      const payload = (await res.json()) as RecommendationJobResponse;
      if (payload.jobId) {
        jobQueueRef.current.enqueue(payload.jobId);
        persistQueue();
        processNextJob();
      }
    } catch (err: any) {
      setRecommendationsError(err.message ?? "No se pudieron obtener las recomendaciones");
    }
  }, [navigate, processNextJob, PENDING_RECS_KEY]);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setPantryError(null);
    setLoadingRecommendations(false);
    historyRef.current = new Stack<PantryItem[]>();
    historyListRef.current = new SinglyLinkedList<{
      id: string;
      createdAt: number;
      items: Recommendation[];
    }>();
    hydrateHistory();
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
      const backendUser: string | undefined = profileData.username;
      const storedUser = localStorage.getItem("ai-recipes:user") ?? sessionStorage.getItem("ai-recipes:user");
      if (storedUser && backendUser && storedUser !== backendUser) {
        clearUserScopedCaches(backendUser);
      } else {
        if (backendUser) {
          localStorage.setItem("ai-recipes:user", backendUser);
          sessionStorage.setItem("ai-recipes:user", backendUser);
        }
      }
      setProfileName(backendUser);

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
    // Limpia cualquier estado pendiente para evitar que se disparen trabajos de IA al entrar.
    localStorage.removeItem(JOB_QUEUE_KEY);
    localStorage.removeItem(PENDING_JOB_KEY);
    sessionStorage.removeItem(PENDING_RECS_KEY);
    jobQueueRef.current = new Queue<string>();
    processingJobRef.current = null;
    stopPolling();
    setLoadingRecommendations(false);

    return () => {
      stopPolling();
    };
  }, [PENDING_JOB_KEY, JOB_QUEUE_KEY, loadInitialData, processNextJob]);

  const handleLogout = useCallback(async () => {
    await fetch(makeApiUrl("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);

    localStorage.removeItem("ai-recipes:user");
    sessionStorage.removeItem("ai-recipes:user");
    navigate("/login");
  }, [navigate]);

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
          pushHistory(prev);
          return [...filtered, saved];
        });
        resetForm();
      } catch (err: any) {
        setPantryError(err.message ?? "No se pudo guardar el ingrediente");
      } finally {
        setProcessing(false);
      }
    },
    [navigate, resetForm]
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

        setItems((prev) => {
          pushHistory(prev);
          return prev.filter((item) => item.ingredientId !== ingredientId);
        });
        resetForm();
      } catch (err: any) {
        setPantryError(err.message ?? "No se pudo eliminar el ingrediente");
      } finally {
        setProcessing(false);
      }
    },
    [navigate, resetForm]
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
          const payloadRes = await response.json().catch(() => null);
          throw new Error(payloadRes?.message ?? "No se pudo guardar la receta sugerida");
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
        }
        navigate(`/recipes/${savedRecipe.id}`);
      } catch (err: any) {
        setRecommendationsError(err.message ?? "No se pudo guardar la receta sugerida");
      }
    },
    [navigate, updateRecommendation]
  );

  const handleRequestAI = useCallback(() => {
    requestRecommendationsJob().catch(() => undefined);
  }, [requestRecommendationsJob]);

  return (
    <div className="pantry-page pantry-page--minimal">
      <HomeNavbar username={profileName} onLogout={handleLogout} />

      <main className="pantry-layout">
        <div className="pantry-layout__header">
          <h1>Mi Despensa Inteligente</h1>
        </div>

        {loading ? (
          <div className="pantry-loader">Cargando tu despensa...</div>
        ) : (
          <>
            <div className="pantry-cards-grid">
              <section className="pantry-card pantry-card--form">
                <h2 className="pantry-card__title">Agregar Ingrediente</h2>
                <PantryForm
                  ingredients={ingredients}
                  initialValues={formValues}
                  onSubmit={handleSubmit}
                  onReset={resetForm}
                  isSaving={processing}
                />
              </section>

              <section className="pantry-card pantry-card--list">
                <div className="pantry-card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                  <h2 className="pantry-card__title">Mi Despensa</h2>
                  <button
                    type="button"
                    className="pantry-chip-button"
                    onClick={handleUndo}
                    disabled={historyRef.current.isEmpty() || processing}
                    title="Deshacer último cambio"
                  >
                    Deshacer
                  </button>
                </div>
                {pantryError && <div className="pantry-error">{pantryError}</div>}
                <PantryList
                  items={sortedItems}
                  onSelect={handleSelectItem}
                  onDelete={handleDelete}
                  isProcessing={processing}
                />
              </section>
            </div>

            <PantryRecommendations
              recommendations={recommendations}
              isLoading={loadingRecommendations}
              error={recommendationsError}
              onSave={handleSaveRecommendation}
              onRequest={handleRequestAI}
              isRequesting={loadingRecommendations}
            />
          </>
        )}
      </main>
    </div>
  );
};
