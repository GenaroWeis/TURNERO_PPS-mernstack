import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TurnosPage from './pages/TurnosPage';
import TurnoFormPage from './pages/TurnoFormPage';//formulario CREATE/UPDATE
import ProfesionalesPage from './pages/ProfesionalesPage';
import ProfesionalFormPage from './pages/ProfesionalFormPage';//formulario CREATE/UPDATE
import ClientesPage from './pages/ClientesPage';
import ClienteFormPage from './pages/ClienteFormPage';//formulario CREATE/UPDATE
import DisponibilidadPage from './pages/DisponibilidadPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/turnos" element={<TurnosPage />} />
        <Route path="/turnos/nuevo" element={<TurnoFormPage />} />
        <Route path="/turnos/:id/editar" element={<TurnoFormPage />} />
        <Route path="/profesionales" element={<ProfesionalesPage />} />
        <Route path="/profesionales/nuevo" element={<ProfesionalFormPage />} />
        <Route path="/profesionales/:id/editar" element={<ProfesionalFormPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/clientes/nuevo" element={<ClienteFormPage />} />
        <Route path="/clientes/:id/editar" element={<ClienteFormPage />} />
        <Route path="/disponibilidad" element={<DisponibilidadPage />} />
      </Routes>
    </Router>
  );
}

export default App;
