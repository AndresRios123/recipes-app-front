import React, { createContext, useContext, useMemo, useState } from "react";
import type { Recommendation } from "../types/pantry";

interface RecommendationContextValue {
  recommendations: Recommendation[];
  setRecommendations: (items: Recommendation[]) => void;
  findByCacheId: (cacheId: string) => Recommendation | undefined;
  updateRecommendation: (cacheId: string, updater: (current: Recommendation) => Recommendation) => void;
}

const RecommendationContext = createContext<RecommendationContextValue | undefined>(undefined);

export const useRecommendationStore = (): RecommendationContextValue => {
  const ctx = useContext(RecommendationContext);
  if (!ctx) {
    throw new Error("useRecommendationStore debe usarse dentro de RecommendationProvider");
  }
  return ctx;
};

export const RecommendationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [recommendations, setRecommendationsState] = useState<Recommendation[]>([]);

  const findByCacheId = (cacheId: string) =>
    recommendations.find((recommendation) => recommendation.cacheId === cacheId);

  const updateRecommendation = (cacheId: string, updater: (current: Recommendation) => Recommendation) => {
    setRecommendationsState((prev) =>
      prev.map((recommendation) =>
        recommendation.cacheId === cacheId ? updater(recommendation) : recommendation
      )
    );
  };

  const value = useMemo<RecommendationContextValue>(
    () => ({
      recommendations,
      setRecommendations: setRecommendationsState,
      findByCacheId,
      updateRecommendation,
    }),
    [recommendations]
  );

  return <RecommendationContext.Provider value={value}>{children}</RecommendationContext.Provider>;
};

