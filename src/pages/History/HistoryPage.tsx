import "../../styles/Pantry.css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HomeNavbar } from "../../components/home/HomeNavbar";
import { PantryRecommendations } from "../../components/pantry/PantryRecommendations";
import type { Recommendation } from "../../types/pantry";
import { makeApiUrl } from "../../config/api";

interface HistoryEntry {
  id: string;
  createdAt: number;
  items: Recommendation[];
}

const HISTORY_STORAGE_KEY = "ai-recipes:history-list";
const MAX_TITLE_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_INSTRUCTIONS_LENGTH = 60000;

const sanitizeText = (text: string | null | undefined, maxLength: number | null = null): string | null => {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (maxLength !== null && trimmed.length > maxLength) {
    return trimmed.slice(0, maxLength);
  }
  return trimmed;
};

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const storedUsername = localStorage.getItem("ai-recipes:user") ?? sessionStorage.getItem("ai-recipes:user");
  const [username, setUsername] = useState<string | undefined>(storedUsername ?? undefined);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as HistoryEntry[];
      setEntries(parsed);
    } catch {
      setEntries([]);
    }
  }, []);

  const orderedEntries = useMemo(
    () => [...entries].sort((a, b) => b.createdAt - a.createdAt),
    [entries]
  );

  const handleLogout = useCallback(async () => {
    await fetch(makeApiUrl("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);
    localStorage.removeItem("ai-recipes:user");
    sessionStorage.removeItem("ai-recipes:user");
    navigate("/login");
  }, [navigate]);

  const handleSaveRecommendation = useCallback(
    async (recommendation: Recommendation) => {
      setSaveError(null);
      setSuccessMessage(null);
      try {
        const sanitizedIngredients =
          recommendation.ingredients
            ?.filter((ingredient) => ingredient.name && ingredient.name.trim().length > 0)
            .map((ingredient) => ({
              name: ingredient.name.trim(),
              quantity: ingredient.quantity,
              unit: sanitizeText(ingredient.unit, 50),
            })) ?? [];

        const difficulty = recommendation.difficulty ? recommendation.difficulty.trim().toUpperCase() : null;

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
        setSuccessMessage(`Receta guardada con ID ${savedRecipe.id ?? ""}`.trim());
      } catch (err: any) {
        setSaveError(err.message ?? "No se pudo guardar la receta sugerida");
      }
    },
    [navigate]
  );

  const formatDate = (value: number) =>
    new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="pantry-page pantry-page--minimal">
      <HomeNavbar username={username} onLogout={handleLogout} />
      <main className="pantry-layout">
        <div className="pantry-layout__header">
          <h1>Historial de recomendaciones</h1>
          <p style={{ color: "#64748b" }}>
            Consulta las sugerencias de recetas generadas previamente y vuelve a guardarlas si lo necesitas.
          </p>
        </div>

        {orderedEntries.length === 0 ? (
          <div className="pantry-loader">Aún no hay historial de recomendaciones.</div>
        ) : (
          orderedEntries.map((entry) => (
            <section key={entry.id} className="pantry-card pantry-card--list" style={{ marginBottom: "1.25rem" }}>
              <div className="pantry-card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 className="pantry-card__title">Generación del {formatDate(entry.createdAt)}</h2>
                <span className="pantry-card__subtitle">Total: {entry.items.length} recetas</span>
              </div>
              {saveError && <div className="pantry-error">{saveError}</div>}
              {successMessage && (
                <div style={{ marginTop: "0.5rem", color: "#0f766e", fontWeight: 600 }}>{successMessage}</div>
              )}
              <PantryRecommendations
                recommendations={entry.items}
                isLoading={false}
                error={null}
                onSave={handleSaveRecommendation}
                isRequesting={false}
              />
            </section>
          ))
        )}
      </main>
    </div>
  );
};
