import React from "react";
import { Link } from "react-router-dom";

interface HomeNavbarProps {
  username?: string;
  onLogout: () => void;
}

/**
 * Navbar principal de la pagina Home.
 */
export const HomeNavbar: React.FC<HomeNavbarProps> = ({ username, onLogout }) => {
  return (
    <nav className="home-navbar">
      <div className="home-navbar__inner">
        <span className="home-navbar__brand">AI Recipes</span>
        <div className="home-navbar__menu-wrapper">
          <div className="home-navbar__menu">
            <Link to="/home">Inicio</Link>
            <Link to="/pantry">Mis ingredientes</Link>
            <a href="#">Recetas</a>
            <a href="#">Favoritos</a>
          </div>
          <div className="home-navbar__actions">
            <button className="home-navbar__button" type="button">
              Ingresar ingredientes
            </button>
            <div className="home-navbar__user">
              <span role="img" aria-label="chef">
                Chef
              </span>
              <span>{username ?? "Invitado"}</span>
              <button className="home-navbar__logout" onClick={onLogout}>
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
