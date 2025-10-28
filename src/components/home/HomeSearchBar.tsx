import React from "react";

interface HomeSearchBarProps {
  search: string;
  category: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

/**
 * Barra de busqueda de recetas.
 */
export const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
  search,
  category,
  onSearchChange,
  onCategoryChange,
  onSubmit,
}) => (
  <form className="home-search" onSubmit={onSubmit}>
    <input
      type="text"
      placeholder="Que quieres cocinar hoy?"
      value={search}
      onChange={(event) => onSearchChange(event.target.value)}
    />
    <select value={category} onChange={(event) => onCategoryChange(event.target.value)}> 
      <option>Todas</option>
      <option>Rapidas</option>
      <option>Desayuno</option>
      <option>Saludables</option>
      <option>Postres</option>
    </select>
    <button type="submit">Buscar recetas</button>
  </form>
);
