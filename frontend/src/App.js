import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TurnosPage from './pages/TurnosPage';
import ProfesionalesPage from './pages/ProfesionalesPage';
import ClientesPage from './pages/ClientesPage';
import DisponibilidadPage from './pages/disponibilidadPage';
import Navbar from './components/navbar';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/turnos" element={<TurnosPage />} />
        <Route path="/profesionales" element={<ProfesionalesPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/disponibilidad" element={<DisponibilidadPage />} />
      </Routes>
    </Router>
  );
}

export default App;
