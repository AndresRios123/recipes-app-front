export interface IngredientOption {
  id: number;
  name: string;
  categoryName: string;
}

export interface PantryItem {
  ingredientId: number;
  ingredientName: string;
  quantity: number;
  unit: string;
  category: {
    id: number;
    name: string;
  };
}

export interface PantryFormValues {
  ingredientId: number | null;
  ingredientName: string;
  quantity: number;
  unit: string;
  categoryId?: number | null;
}

export interface Recommendation {
  recipeId: number | null;
  title: string;
  matchScore: number;
  missingIngredients: string[];
  description?: string | null;
  instructions?: string | null;
  prepTimeMinutes?: number | null;
  difficulty?: string | null;
  imageUrl?: string | null;
  ingredients?: Array<{
    name: string;
    quantity: number | null;
    unit: string | null;
  }>;
  cacheId?: string;
}
