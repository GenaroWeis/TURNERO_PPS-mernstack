// src/pages/DisponibilidadesPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  listDisponibilidades,
  removeDisponibilidad,
} from '../services/disponibilidadService';

import SearchBar from '../components/SearchBar';
import DayFilter from '../components/DayFilter';
import ProfesionalWeekView from '../components/ProfesionalWeekView';
import { includesSome } from '../utils/searchUtils';
import '../styles/disponibilidad.css';

const DIAS_ORDEN = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];
const idxDia = (d) => DIAS_ORDEN.indexOf((d || '').toString().toLowerCase());

function DisponibilidadesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // filtros
  const [query, setQuery] = useState('');
  const [dayFilter, setDayFilter] = useState('');

  // modo profesional
  const [focusMode, setFocusMode] = useState(false);
  const [focusedProfId, setFocusedProfId] = useState('');

  const location = useLocation();

  // fetch
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await listDisponibilidades();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err?.response?.data?.message || 'No se pudieron cargar las disponibilidades.';
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // eliminar
  const handleDelete = async (id) => {
    const ok = window.confirm('¿Eliminar esta disponibilidad? Esta acción no se puede deshacer.');
    if (!ok) return;
    try {
      const done = await removeDisponibilidad(id);
      if (done) {
        setMessage('Disponibilidad eliminada correctamente.');
        await fetchData();
      } else {
        setError('No se pudo eliminar la disponibilidad.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'No se pudo eliminar la disponibilidad.';
      setError(msg);
    }
  };

  // 1) filtro por texto
  const filteredByText = useMemo(() => {
    const q = query.trim();
    if (!q) return items;
    return items.filter((d) => {
      const p = d.profesional || {};
      return includesSome(q, [
        d.diaSemana,
        d.horaInicio,
        d.horaFin,
        p.nombre,
        p.especialidad,
        p.email,
      ]);
    });
  }, [items, query]);

  // 2) filtro por día (no aplica en focusMode → mostramos semana completa allí)
  const filtered = useMemo(() => {
    if (!dayFilter || focusMode) return filteredByText;
    return filteredByText.filter(d => (d.diaSemana || '').toLowerCase() === dayFilter.toLowerCase());
  }, [filteredByText, dayFilter, focusMode]);

  // 3) LISTA PLANA ORDENADA para “quedar junta por profesional”:
  //    profesional (A–Z) → día (L→D) → horaInicio (asc)
  const view = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const an = a.profesional?.nombre || '';
      const bn = b.profesional?.nombre || '';
      if (an !== bn) return an.localeCompare(bn);

      const da = idxDia(a.diaSemana);
      const db = idxDia(b.diaSemana);
      if (da !== db) return da - db;

      return (a.horaInicio || '').localeCompare(b.horaInicio || '');
    });
    return arr;
  }, [filtered]);

  // Profesionales derivados del set filtrado por texto (para modo profesional)
  const profList = useMemo(() => {
    const base = filteredByText; // en focusMode ignoramos dayFilter a propósito
    const map = new Map();
    base.forEach(d => {
      const p = d.profesional;
      if (p && p._id && !map.has(p._id)) {
        map.set(p._id, p);
      }
    });
    return Array.from(map.values()).sort((a,b) => (a.nombre || '').localeCompare(b.nombre || ''));
  }, [filteredByText]);

  // autoseleccionar si hay un solo match
  useEffect(() => {
    if (focusMode && !focusedProfId && profList.length === 1) {
      setFocusedProfId(profList[0]._id);
    }
  }, [focusMode, focusedProfId, profList]);

  const focusedProf = useMemo(
    () => profList.find(p => p._id === focusedProfId),
    [profList, focusedProfId]
  );

  const focusedItems = useMemo(() => {
    if (!focusedProfId) return [];
    return (filteredByText || []).filter(d => d.profesional?._id === focusedProfId);
  }, [filteredByText, focusedProfId]);

  if (loading) return <div className="container py-3">Cargando...</div>;

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 m-0">Disponibilidades</h1>
        <Link to="/disponibilidad/nuevo" className="btn btn-primary">Nueva disponibilidad</Link>
      </div>

      {/* Controles superiores: SearchBar + Día con el MISMO tamaño que antes */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-lg-8">
          <SearchBar
            labelText={focusMode ? 'Buscar profesional' : 'Buscar disponibilidad'}
            placeholder={focusMode ? '' : 'Ej: martes, 09:00, Julieta, Colorista, correo@mail.com'}
            query={query}
            onQueryChange={setQuery}
          />
        </div>
        {!focusMode && (
          <div className="col-12 col-lg-4">
            <DayFilter value={dayFilter} onChange={setDayFilter} />
          </div>
        )}
      </div>

      {/* Botón de modo profesional, más protagonista */}
      <div className="mb-3 d-grid d-sm-flex justify-content-between align-items-center">
        <div className="small text-muted mb-2 mb-sm-0">
          {focusMode
            ? 'Modo profesional activo: buscá un profesional y seleccioná para ver su semana.'
            : 'Podés activar el modo profesional para enfocarte en una persona.'}
        </div>
        <button
          type="button"
          className={`btn btn-${focusMode ? 'secondary' : 'primary'} btn-lg`}
          onClick={() => { setFocusMode(!focusMode); setFocusedProfId(''); }}
        >
          {focusMode ? 'Salir del modo profesional' : 'Modo profesional'}
        </button>
      </div>

      {/* MODO PROFESIONAL */}
      {focusMode ? (
        <div className="focus-mode-surface p-3 rounded">
          {/* Lista de profesionales (no mostramos la tabla de disponibilidades en este modo) */}
          {profList.length === 0 ? (
            <div className="alert alert-info mb-3">No hay profesionales que coincidan con la búsqueda.</div>
          ) : (
            <div className="list-group pro-list mb-3">
              {profList.map(p => {
                const active = focusedProfId === p._id;
                return (
                  <button
                    key={p._id}
                    type="button"
                    className={`list-group-item list-group-item-action ${active ? 'active' : ''}`}
                    onClick={() => setFocusedProfId(p._id)}
                    title={p.email || ''}
                  >
                    <div className="d-flex w-100 justify-content-between">
                      <h6 className="mb-1">
                        {p.nombre} {p.especialidad ? <span className="text-light-emphasis">({p.especialidad})</span> : null}
                      </h6>
                      {p.email ? <small className={active ? 'text-white-50' : 'text-muted'}>{p.email}</small> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Vista semanal del profesional elegido */}
          {focusedProfId && (
            <ProfesionalWeekView
              profesional={focusedProf}
              items={focusedItems}
              onDelete={handleDelete}
            />
          )}
        </div>
      ) : (
        // MODO LISTA (tabla) — ya ordenada para "quedar junta por profesional"
        <>
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          {view.length === 0 && !error ? (
            <div className="alert alert-info">No hay disponibilidades que coincidan con el filtro.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Profesional</th>
                    <th>Día</th>
                    <th>Hora inicio</th>
                    <th>Hora fin</th>
                    <th style={{ width: 160 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {view.map((d) => (
                    <tr key={d._id}>
                      <td>
                        {d.profesional
                          ? (<>
                              {d.profesional.nombre}
                              {d.profesional.especialidad ? (
                                <span className="text-primary"> ({d.profesional.especialidad})</span>
                              ) : null}
                              {d.profesional.email ? ` — ${d.profesional.email}` : ''}
                            </>)
                          : '—'}
                      </td>
                      <td className="text-capitalize">{d.diaSemana}</td>
                      <td>{d.horaInicio}</td>
                      <td>{d.horaFin}</td>
                      <td>
                        <Link
                          to={`/disponibilidad/${d._id}/editar`}
                          className="btn btn-sm btn-secondary me-2"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(d._id)}
                          className="btn btn-sm btn-danger"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DisponibilidadesPage;
