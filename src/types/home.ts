export interface RecommendedRecipe {
  id: number;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  time: string;
  image: string;
}

export interface CategoryHighlight {
  name: string;
  icon: string;
}

export interface HowItWorksStep {
  title: string;
  description: string;
  gradient: string;
}