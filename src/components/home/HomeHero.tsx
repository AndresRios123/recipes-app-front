import React from "react";

interface HomeHeroProps {
  username?: string;
  onAddIngredients: () => void;
}

/**
 * Seccion hero de la landing Home.
 */
export const HomeHero: React.FC<HomeHeroProps> = ({ username, onAddIngredients }) => (
  <section className="home-hero">
    <div className="home-hero__inner">
      <div className="home-hero__content">
        <h1 className="home-hero__title">
          Descubre recetas con los ingredientes que ya tienes
        </h1>
        <p className="home-hero__subtitle">
          Usamos IA para ayudarte a cocinar facil, rapido y sin desperdiciar. Hola {username ?? "chef"}!
        </p>
        <button className="home-hero__cta" type="button" onClick={onAddIngredients}>
          Ingresar ingredientes
        </button>
      </div>
      <div className="home-hero__figure">
        <img
          className="home-hero__image"
          src="https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=1200&q=80"
          alt="Ingredientes frescos"
        />
      </div>
    </div>
  </section>
);
