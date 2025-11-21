import React, { useState } from "react";
import type { Recommendation } from "../../types/pantry";

interface PantryRecommendationsProps {
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;
  onSave: (recommendation: Recommendation) => void;
  onRequest?: () => void;
  isRequesting?: boolean;
}

/**
 * Lista de recomendaciones generadas por la IA con información desplegable.
 */
export const PantryRecommendations: React.FC<PantryRecommendationsProps> = ({
  recommendations,
  isLoading,
  error,
  onSave,
  onRequest,
  isRequesting = false,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (key: string) => {
    setExpandedId((current) => (current === key ? null : key));
  };

  return (
    <section className="pantry-card pantry-recommendations">
      <div className="pantry-recommendations__header">
        <div>
          <h2 className="pantry-card__title">Recomendación de Recetas con IA</h2>
          <p className="pantry-card__subtitle">
            Sugiere recetas basadas en los ingredientes que tienes.
          </p>
        </div>
        {onRequest && (
          <button
            type="button"
            className="pantry-suggest-btn"
            onClick={onRequest}
            disabled={isRequesting}
          >
            <span className="pantry-suggest-btn__icon" aria-hidden="true">
              AI
            </span>
            <span>{isRequesting ? "Generando..." : "Sugerir"}</span>
          </button>
        )}
      </div>

      {isLoading && (
        <div className="pantry-ai-loader" aria-live="polite" aria-busy="true">
          <span className="pantry-ai-loader__spinner" aria-hidden="true" />
          <span className="pantry-ai-loader__text">Generando recetas</span>
        </div>
      )}
      {!isLoading && error && <p className="pantry-error">{error}</p>}
      {!isLoading && !error && recommendations.length === 0 && (
        <p className="pantry-empty">Aquí verás las recetas generadas. Presiona "Sugerir" para obtener ideas.</p>
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
              : `suggestion-${recommendation.cacheId ?? recommendation.title}`;
            const isExpanded = expandedId === itemKey;

            return (
              <li key={itemKey} className="pantry-recommendations__item">
                <div className="pantry-recommendations__item-header">
                  <div>
                    <p className="pantry-recommendations__title">{recommendation.title}</p>
                    <p className="pantry-recommendations__meta">
                      {hasAll ? "Tienes todos los ingredientes" : "Faltan algunos ingredientes"} - Coincidencia {scorePercent}%
                    </p>
                  </div>
                  <div className="pantry-recommendations__item-actions">
                    <button
                      type="button"
                      className="pantry-chip-button pantry-chip-button--primary"
                      onClick={() => onSave(recommendation)}
                      disabled={isPersisted}
                      title={isPersisted ? "Esta receta ya está guardada" : undefined}
                    >
                      {isPersisted ? "Guardada" : "Guardar"}
                    </button>
                    <button
                      type="button"
                      className="pantry-chip-button"
                      onClick={() => toggleExpanded(itemKey)}
                    >
                      {isExpanded ? "Ver menos" : "Ver"}
                    </button>
                  </div>
                </div>

                {recommendation.description && (
                  <p className="pantry-recommendations__description">
                    {recommendation.description}
                  </p>
                )}

                {(recommendation.instructions || recommendation.ingredients?.length) && isExpanded && (
                  <div className="pantry-recommendations__instructions">
                    <div className="pantry-recommendations__instructions-content">
                      {recommendation.ingredients && recommendation.ingredients.length > 0 && (
                        <>
                          <h4>Ingredientes sugeridos</h4>
                          <ul>
                            {recommendation.ingredients.map((ingredient, index) => (
                              <li key={`${ingredient.name}-${index}`}>
                                {ingredient.quantity ?? ""} {ingredient.unit ?? ""} {ingredient.name}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      {recommendation.instructions && (
                        <>
                          <h4>Pasos sugeridos</h4>
                          <p>{recommendation.instructions}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
