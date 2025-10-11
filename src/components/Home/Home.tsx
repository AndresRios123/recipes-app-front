import "../../styles/Home.css";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

interface RecommendedRecipe {
  title: string;
  difficulty: "Fácil" | "Mediano" | "Experto";
  time: string;
  image: string;
}

interface CategoryHighlight {
  name: string;
  icon: string;
}

interface HowItWorksStep {
  title: string;
  description: string;
  gradient: string;
}

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");

  const recommendedRecipes: RecommendedRecipe[] = useMemo(
    () => [
      {
        title: "Ensalada Mediterránea",
        difficulty: "Fácil",
        time: "15 min",
        image:
          "https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=640&q=80",
      },
      {
        title: "Pasta con Tomate",
        difficulty: "Mediano",
        time: "25 min",
        image:
          "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=640&q=80",
      },
      {
        title: "Tortilla de Verduras",
        difficulty: "Fácil",
        time: "20 min",
        image:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=640&q=80",
      },
      {
        title: "Crema de Calabaza",
        difficulty: "Fácil",
        time: "30 min",
        image:
          "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=640&q=80",
      },
    ],
    []
  );

  const categoryHighlights: CategoryHighlight[] = useMemo(
    () => [
      { name: "Postres", icon: "🧁" },
      { name: "Platos rápidos", icon: "⚡️" },
      { name: "Saludables", icon: "🥗" },
      { name: "Veganos", icon: "🌱" },
      { name: "Desayunos", icon: "🥐" },
    ],
    []
  );

  const howItWorks: HowItWorksStep[] = useMemo(
    () => [
      {
        title: "Escribe tus ingredientes",
        description: "Agrega lo que tienes en la despensa y tu refrigerador.",
        gradient: "linear-gradient(135deg, #f97316, #fb923c)",
      },
      {
        title: "Recibe recetas posibles",
        description: "Nuestra IA calcula las mejores opciones para ti.",
        gradient: "linear-gradient(135deg, #2563eb, #1d4ed8)",
      },
      {
        title: "Cocina y guarda favoritas",
        description: "Sigue los pasos, marca favoritas y crea tu historial.",
        gradient: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
      },
    ],
    []
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:8088/api/auth/profile", {
          credentials: "include",
        });

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("No se pudo obtener el perfil");
        }

        const data: UserProfile = await response.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message ?? "Ocurrió un error inesperado");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await fetch("http://localhost:8088/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);

    localStorage.removeItem("ai-recipes:user");
    sessionStorage.removeItem("ai-recipes:user");
    navigate("/login");
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    // Placeholder: integrate with search endpoint in future iteration.
  };

  return (
    <div className="home-page">
      <nav className="home-navbar">
        <div className="home-navbar__inner">
          <span className="home-navbar__brand">AI Recipes</span>
          <div className="home-navbar__menu-wrapper">
            <div className="home-navbar__menu">
              <Link to="#">Inicio</Link>
              <Link to="#">Mis ingredientes</Link>
              <Link to="#">Recetas</Link>
              <Link to="#">Favoritos</Link>
            </div>
            <div className="home-navbar__actions">
              <button className="home-navbar__button" type="button">
                Ingresar ingredientes
              </button>
              <div className="home-navbar__user">
                <span role="img" aria-label="chef">
                  👩‍🍳
                </span>
                <span>{profile ? profile.username : "Invitado"}</span>
                <button className="home-navbar__logout" onClick={handleLogout}>
                  Salir
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {loading && <div className="home-loader">Cargando tu experiencia...</div>}
      {error && <div className="home-error">{error}</div>}

      {!loading && !error && (
        <>
          <section className="home-hero">
            <div className="home-hero__inner">
              <div className="home-hero__content">
                <h1 className="home-hero__title">
                  Descubre recetas con los ingredientes que ya tienes
                </h1>
                <p className="home-hero__subtitle">
                  Usamos IA para ayudarte a cocinar fácil, rápido y sin
                  desperdiciar. ¡Hola {profile?.username ?? "chef"}!
                </p>
                <button className="home-hero__cta" type="button">
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

          <form className="home-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="¿Qué quieres cocinar hoy?"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option>Todas</option>
              <option>Rápidas</option>
              <option>Desayuno</option>
              <option>Saludables</option>
              <option>Postres</option>
            </select>
            <button type="submit">Buscar recetas</button>
          </form>

          <section className="home-section">
            <div className="home-section__header">
              <h2 className="home-section__title">
                Recomendaciones para ti 🍽️
              </h2>
              <Link to="#" className="auth-link">
                Ver todas
              </Link>
            </div>
            <div className="home-cards">
              {recommendedRecipes.map((recipe) => (
                <article key={recipe.title} className="home-recipe-card">
                  <img src={recipe.image} alt={recipe.title} />
                  <div className="home-recipe-card__body">
                    <h3 className="home-recipe-card__title">{recipe.title}</h3>
                    <div className="home-recipe-card__meta">
                      {recipe.difficulty} · {recipe.time}
                    </div>
                    <Link className="home-recipe-card__link" to="#">
                      Ver receta
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="home-section">
            <div className="home-section__header">
              <h2 className="home-section__title">Categorías destacadas</h2>
            </div>
            <div className="home-category-grid">
              {categoryHighlights.map((category) => (
                <div key={category.name} className="home-category-item">
                  <div className="home-category-icon">{category.icon}</div>
                  <span>{category.name}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="home-section">
            <div className="home-section__header">
              <h2 className="home-section__title">¿Cómo funciona?</h2>
            </div>
            <div className="home-howto">
              {howItWorks.map((step, index) => (
                <div key={step.title} className="home-howto__item">
                  <div
                    className="home-howto__step"
                    style={{ background: step.gradient }}
                  >
                    {index + 1}
                  </div>
                  <h3 className="home-howto__title">{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
