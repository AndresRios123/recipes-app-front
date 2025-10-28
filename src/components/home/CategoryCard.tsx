import React from "react";
import type { CategoryHighlight } from "../../types/home";

interface CategoryCardProps {
  category: CategoryHighlight;
}

/**
 * Tarjeta circular para cada categoria destacada.
 */
export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => (
  <div className="home-category-item">
    <div className="home-category-icon">{category.icon}</div>
    <span>{category.name}</span>
  </div>
);
