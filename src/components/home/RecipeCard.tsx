import React from "react";
import type { RecommendedRecipe } from "../../types/home";

const difficultyLabels: Record<RecommendedRecipe["difficulty"], string> = {
  easy: "Facil",
  medium: "Mediano",
  hard: "Experto",
};

interface RecipeCardProps {
  recipe: RecommendedRecipe;
  onSelect: (recipeId: number) => void;
}

/**
 * Tarjeta visual para cada receta recomendada.
 */
export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect }) => (
  <article className="home-recipe-card">
    <img src={recipe.image} alt={recipe.title} />
    <div className="home-recipe-card__body">
      <h3 className="home-recipe-card__title">{recipe.title}</h3>
      <div className="home-recipe-card__meta">
        {difficultyLabels[recipe.difficulty]} - {recipe.time}
      </div>
      <button
        type="button"
        className="home-recipe-card__link"
        onClick={() => onSelect(recipe.id)}
      >
        Ver receta
      </button>
    </div>
  </article>
);