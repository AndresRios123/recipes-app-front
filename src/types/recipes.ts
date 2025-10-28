export interface RecipeDetail {
  id: number;
  name: string;
  description: string;
  instructions: string;
  prepTimeMinutes: number | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  imageUrl: string | null;
  ingredients: Array<{
    ingredientId: number;
    ingredientName: string;
    quantity: number;
    unit: string;
    notes: string | null;
  }>;
}