import React from "react";
import type { HowItWorksStep } from "../../types/home";

interface HowToStepCardProps {
  step: HowItWorksStep;
  index: number;
}

/**
 * Tarjeta explicativa para el flujo "Como funciona".
 */
export const HowToStepCard: React.FC<HowToStepCardProps> = ({ step, index }) => (
  <div className="home-howto__item">
    <div className="home-howto__step" style={{ background: step.gradient }}>
      {index + 1}
    </div>
    <h3 className="home-howto__title">{step.title}</h3>
    <p>{step.description}</p>
  </div>
);