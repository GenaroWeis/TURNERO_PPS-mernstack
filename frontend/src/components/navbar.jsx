import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <Link to="/">Inicio</Link> | 
      <Link to="/turnos">Turnos</Link> | 
      <Link to="/crear-turno">Crear Turno</Link>
    </nav>
  );
}

export default Navbar;
