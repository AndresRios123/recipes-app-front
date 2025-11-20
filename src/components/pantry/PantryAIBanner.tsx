import React from "react";

interface PantryAIBannerProps {
  onRequestRecipes: () => void;
  isLoading?: boolean;
}

/**
 * Banner que activara la integracion con el motor de IA (Gemini API).
 */
export const PantryAIBanner: React.FC<PantryAIBannerProps> = ({
  onRequestRecipes,
  isLoading = false,
}) => (
  <section className="pantry-ai">
    <div className="pantry-ai__content">
      <h2>Listo para descubrir recetas con IA?</h2>
      <p>
        Analizaremos tu despensa y consultaremos la API de Gemini para proponerte platos
        que se adapten a los ingredientes que ya tienes.
      </p>
    </div>
    <button
      className="pantry-ai__button"
      type="button"
      onClick={onRequestRecipes}
      disabled={isLoading}
    >
      <span className="pantry-ai__icon" aria-hidden="true">
        🤖
      </span>
      <span>{isLoading ? "Generando..." : "Pedir recetas a la IA"}</span>
    </button>
  </section>
);
