// Barra de navegación principal de la app: enlaces internos a secciones (SPA) usando NavLink.

import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark">
      <div className="container">
        <NavLink to="/" className="navbar-brand">Turnero Admin</NavLink> 
        <div className="navbar-nav">
          <NavLink to="/turnos" className="nav-link">Turnos</NavLink>
          <NavLink to="/clientes" className="nav-link">Clientes</NavLink>
          <NavLink to="/profesionales" className="nav-link">Profesionales</NavLink>
          <NavLink to="/disponibilidad" className="nav-link">Disponibilidad</NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

/* -----------------------------------------
   Imports y props
   - NavLink: componente de react-router-dom para navegación interna; añade clase "active" al coincidir la ruta.
----------------------------------------- */
