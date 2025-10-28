import React from "react";
import type { HowItWorksStep } from "../../types/home";
import { HowToStepCard } from "./HowToStepCard";

interface HomeHowItWorksProps {
  steps: HowItWorksStep[];
}

/**
 * Sección que explica el proceso de recomendación.
 */
export const HomeHowItWorks: React.FC<HomeHowItWorksProps> = ({ steps }) => (
  <section className="home-section">
    <div className="home-section__header">
      <h2 className="home-section__title">¿Cómo funciona?</h2>
    </div>
    <div className="home-howto">
      {steps.map((step, index) => (
        <HowToStepCard key={step.title} step={step} index={index} />
      ))}
    </div>
  </section>
);