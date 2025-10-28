import React from "react";
import type { CategoryHighlight } from "../../types/home";
import { CategoryCard } from "./CategoryCard";

interface HomeCategoriesProps {
  categories: CategoryHighlight[];
}

/**
 * Seccion de categorias destacadas.
 */
export const HomeCategories: React.FC<HomeCategoriesProps> = ({ categories }) => (
  <section className="home-section">
    <div className="home-section__header">
      <h2 className="home-section__title">Categorias destacadas</h2>
    </div>
    <div className="home-category-grid">
      {categories.map((category) => (
        <CategoryCard key={category.name} category={category} />
      ))}
    </div>
  </section>
);
