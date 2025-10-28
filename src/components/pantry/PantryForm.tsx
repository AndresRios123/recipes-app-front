import React, { useEffect, useState } from "react";
import type { IngredientOption, PantryFormValues } from "../../types/pantry";

interface PantryFormProps {
  ingredients: IngredientOption[];
  initialValues: PantryFormValues;
  onSubmit: (values: PantryFormValues) => void;
  onReset: () => void;
  isSaving: boolean;
}

/**
 * Formulario controlado para agregar/actualizar ingredientes en la despensa.
 */
export const PantryForm: React.FC<PantryFormProps> = ({
  ingredients,
  initialValues,
  onSubmit,
  onReset,
  isSaving,
}) => {
  const [formValues, setFormValues] = useState<PantryFormValues>(initialValues);

  useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  const handleIngredientChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const match = ingredients.find((ingredient) => ingredient.name.toLowerCase() === value.toLowerCase());
    setFormValues((prev) => ({
      ...prev,
      ingredientName: value,
      ingredientId: match ? match.id : null,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formValues.ingredientName.trim() && !formValues.ingredientId) {
      return;
    }
    onSubmit(formValues);
  };

  return (
    <form className="pantry-form" onSubmit={handleSubmit}>
      <h2 className="pantry-form__title">Agregar ingrediente a mi despensa</h2>

      <div className="pantry-form__grid">
        <label className="pantry-form__field">
          <span>Ingrediente</span>
          <input
            type="text"
            name="ingredientName"
            value={formValues.ingredientName}
            onChange={handleIngredientChange}
            list="ingredient-options"
            placeholder="Escribe o selecciona un ingrediente"
            required
          />
          <datalist id="ingredient-options">
            {ingredients.map((ingredient) => (
              <option key={ingredient.id} value={ingredient.name} />
            ))}
          </datalist>
        </label>

        <label className="pantry-form__field">
          <span>Cantidad</span>
          <input
            type="number"
            min="0"
            step="0.1"
            name="quantity"
            value={formValues.quantity}
            onChange={handleFieldChange}
            required
          />
        </label>

        <label className="pantry-form__field">
          <span>Unidad</span>
          <input
            type="text"
            name="unit"
            value={formValues.unit}
            onChange={handleFieldChange}
            placeholder="gramos, piezas, ml..."
            required
          />
        </label>
      </div>

      <div className="pantry-form__actions">
        <button className="pantry-form__submit" type="submit" disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar ingrediente"}
        </button>
        <button className="pantry-form__reset" type="button" onClick={onReset} disabled={isSaving}>
          Limpiar
        </button>
      </div>
    </form>
  );
};