import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listTurnos } from '../services/turnoService';
import '../styles/home.css';

function formatFecha(iso) {
  const d = iso ? new Date(iso) : null;
  return (d && !isNaN(d)) ? d.toLocaleDateString('es-AR') : '-';
}
const formatHora = (h) => h || '-';
const badgeForEstado = (estado) => {
  if (estado === 'confirmado') return 'badge bg-success';
  if (estado === 'cancelado') return 'badge bg-danger';
  return 'badge bg-secondary';
};

export default function HomePage() {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const items = await listTurnos();
        setTurnos(Array.isArray(items) ? items : []);
      } catch (err) {
        const msg = err?.response?.data?.message || 'No se pudieron cargar los turnos.';
        setError(msg);
        setTurnos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Stats
  const stats = useMemo(() => {
    const total = turnos.length;
    const pendientes = turnos.filter(t => (t.estado || 'pendiente') === 'pendiente').length;
    const confirmados = turnos.filter(t => t.estado === 'confirmado').length;
    const cancelados = turnos.filter(t => t.estado === 'cancelado').length;
    return { total, pendientes, confirmados, cancelados };
  }, [turnos]);

  // Últimos 5 turnos por fecha/hora desc
  const ultimos = useMemo(() => {
    const copy = [...turnos];
    copy.sort((a, b) => {
      const da = a.fecha ? new Date(a.fecha).getTime() : 0;
      const db = b.fecha ? new Date(b.fecha).getTime() : 0;
      if (da !== db) return db - da;
      const ha = a.hora || '';
      const hb = b.hora || '';
      return hb.localeCompare(ha);
    });
    return copy.slice(0, 5);
  }, [turnos]);

  return (
    <div className="home">
      {/* HERO */}
      <section className="home-hero shadow-sm">
        <div className="container py-5">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-7">
              <h1 className="display-6 fw-semibold text-white mb-2 hero-title">
                Gestión de Turnos
              </h1>
              <p className="lead text-white-50 mb-4">
                Creá, organizá y seguí tus citas en un solo lugar.
                Visualizá profesionales, disponibilidades y clientes de forma rápida.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/turnos" className="btn btn-light btn-lg hero-cta pulse-shadow">
                  Ir a Turnos
                </Link>
                <Link to="/turnos/nuevo" className="btn btn-outline-light btn-lg">
                  Nuevo turno
                </Link>
              </div>
            </div>
            <div className="col-12 col-lg-5">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total</div>
                  <div className="stat-value">{stats.total}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Pendientes</div>
                  <div className="stat-value">{stats.pendientes}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Confirmados</div>
                  <div className="stat-value">{stats.confirmados}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Cancelados</div>
                  <div className="stat-value">{stats.cancelados}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENIDO */}
      <section className="container py-4">
        {/* Atajos */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6 col-lg-3">
            <Link to="/turnos" className="quick-link turnos">
              <div className="quick-link-title">Turnos</div>
              <div className="quick-link-desc">Ver y gestionar</div>
            </Link>
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <Link to="/disponibilidad" className="quick-link disp">
              <div className="quick-link-title">Disponibilidad</div>
              <div className="quick-link-desc">Días y horarios</div>
            </Link>
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <Link to="/profesionales" className="quick-link prof">
              <div className="quick-link-title">Profesionales</div>
              <div className="quick-link-desc">Equipo y especialidades</div>
            </Link>
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <Link to="/clientes" className="quick-link cli">
              <div className="quick-link-title">Clientes</div>
              <div className="quick-link-desc">Agenda y datos</div>
            </Link>
          </div>
        </div>

        {/* Últimos turnos */}
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="m-0">Últimos turnos</h5>
              <Link to="/turnos" className="btn btn-sm btn-primary">Ver todos</Link>
            </div>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="p-3">Cargando...</div>
            ) : error ? (
              <div className="alert alert-danger m-3">{error}</div>
            ) : ultimos.length === 0 ? (
              <div className="p-3 text-muted">Todavía no hay turnos.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Estado</th>
                      <th>Profesional</th>
                      <th>Cliente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimos.map(t => (
                      <tr key={t._id}>
                        <td>{formatFecha(t.fecha)}</td>
                        <td>{formatHora(t.hora)}</td>
                        <td>
                          <span className={badgeForEstado(t.estado)}>
                            {t.estado || 'pendiente'}
                          </span>
                        </td>
                        <td>
                          {t.profesional
                            ? <>
                                {t.profesional.nombre}
                                {t.profesional.especialidad
                                  ? <span className="text-primary"> ({t.profesional.especialidad})</span>
                                  : null}
                              </>
                            : '-'}
                        </td>
                        <td>{t.cliente ? t.cliente.nombre : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

