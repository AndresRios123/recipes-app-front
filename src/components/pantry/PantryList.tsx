import React from "react";
import type { PantryItem } from "../../types/pantry";

interface PantryListProps {
  items: PantryItem[];
  onSelect: (item: PantryItem) => void;
  onDelete: (ingredientId: number) => void;
  isProcessing: boolean;
}

/**
 * Lista los ingredientes guardados en la despensa del usuario.
 */
export const PantryList: React.FC<PantryListProps> = ({ items, onSelect, onDelete, isProcessing }) => {
  if (items.length === 0) {
    return <p className="pantry-empty">Aun no has agregado ingredientes a tu despensa.</p>;
  }

  return (
    <ul className="pantry-list">
      {items.map((item) => (
        <li key={item.ingredientId} className="pantry-list__item">
          <div>
            <h3>{item.ingredientName}</h3>
            <p>
              {item.quantity} {item.unit} - {item.category.name}
            </p>
          </div>
          <div className="pantry-list__actions">
            <button type="button" onClick={() => onSelect(item)} disabled={isProcessing}>
              Editar
            </button>
            <button
              type="button"
              className="pantry-list__delete"
              onClick={() => onDelete(item.ingredientId)}
              disabled={isProcessing}
            >
              Eliminar
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};