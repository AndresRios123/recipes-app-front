import React from "react";
import type { Recommendation } from "../../types/pantry";

interface PantryRecommendationsProps {
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;
  onSelect: (recommendation: Recommendation) => void;
  onSave: (recommendation: Recommendation) => void;
}

/**
 * Lista de recomendaciones generadas por la IA.
 */
export const PantryRecommendations: React.FC<PantryRecommendationsProps> = ({
  recommendations,
  isLoading,
  error,
  onSelect,
  onSave,
}) => (
  <section className="pantry-recommendations">
    <h2 className="pantry-section-title">Recomendaciones con IA</h2>
    {isLoading && <p className="pantry-loader">Consultando a la IA...</p>}
    {!isLoading && error && <p className="pantry-error">{error}</p>}
    {!isLoading && !error && recommendations.length === 0 && (
      <p className="pantry-empty">Agrega ingredientes para obtener sugerencias.</p>
    )}
    {!isLoading && !error && recommendations.length > 0 && (
      <ul className="pantry-recommendations__list">
        {recommendations.map((recommendation) => {
          const isPersisted = recommendation.recipeId !== null;
          const hasAll = recommendation.missingIngredients.length === 0;
          const normalizedScore = Math.min(Math.max(recommendation.matchScore ?? 0, 0), 1);
          const scorePercent = Math.round(normalizedScore * 100);
          const itemKey = isPersisted
            ? `recipe-${recommendation.recipeId}`
            : `suggestion-${recommendation.title}-${recommendation.matchScore}`;

          return (
            <li key={itemKey} className="pantry-recommendations__item">
              <div>
                <h3>{recommendation.title}</h3>
                <p>Puntaje de coincidencia: {scorePercent}%</p>
              </div>
              <p className="pantry-recommendations__missing">
                {hasAll
                  ? "Tienes todos los ingredientes"
                  : `Falta: ${recommendation.missingIngredients.join(", ")}`}
              </p>

              <div className="pantry-recommendations__actions">
                <button
                  type="button"
                  className="pantry-recommendations__button pantry-recommendations__button--primary"
                  onClick={() => onSave(recommendation)}
                  disabled={isPersisted}
                  title={isPersisted ? "Esta receta ya se guardó en tu recetario" : undefined}
                >
                  {isPersisted ? "Receta guardada" : "Guardar receta"}
                </button>
                <button
                  type="button"
                  className="pantry-recommendations__button pantry-recommendations__button--secondary"
                  onClick={() => onSelect(recommendation)}
                  disabled={!isPersisted}
                  title={
                    isPersisted
                      ? "Ver los detalles de esta receta"
                      : "Guarda la receta para poder verla completa"
                  }
                >
                  Ver receta
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </section>
);
