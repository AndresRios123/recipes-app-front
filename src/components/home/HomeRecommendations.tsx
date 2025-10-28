import React from "react";
import type { RecommendedRecipe } from "../../types/home";
import { RecipeCard } from "./RecipeCard";

interface HomeRecommendationsProps {
  recipes: RecommendedRecipe[];
  onSelect: (recipeId: number) => void;
}

/**
 * Seccion que lista las recomendaciones para el usuario.
 */
export const HomeRecommendations: React.FC<HomeRecommendationsProps> = ({ recipes, onSelect }) => (
  <section className="home-section">
    <div className="home-section__header">
      <h2 className="home-section__title">Recomendaciones para ti</h2>
      <a className="auth-link" href="#">
        Ver todas
      </a>
    </div>
    {recipes.length === 0 ? (
      <p className="home-error">Aun no tenemos recetas recomendadas. Prueba agregando ingredientes.</p>
    ) : (
      <div className="home-cards">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} onSelect={onSelect} />
        ))}
      </div>
    )}
  </section>
);