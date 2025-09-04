//muestro la disponibilidad del profesional agrupada por día y ordenada por hora.

import { useEffect, useMemo, useState } from 'react';
import { listDisponibilidadesByProfesional } from '../services/disponibilidadService';

// Orden y rótulos canónicos
const DIAS_ORDEN = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];
const idxDia = (d) => DIAS_ORDEN.indexOf((d || '').toString().toLowerCase()); // convierto a índice según orden

// Agrupa por día y ordena
const agruparYOrdenar = (items = []) => {
  const map = items.reduce((acc, d) => {
    const k = d.diaSemana;           // uso el nombre de día como clave
    acc[k] = acc[k] || [];           // inicializo array para ese día si no existe
    acc[k].push(d);                  // acumulo el rango en su día
    return acc;
  }, {});
  // Ordeno por día según DIAS_ORDEN; dentro de cada día ordeno por horaInicio asc
  return Object.keys(map)
    .sort((a,b) => idxDia(a) - idxDia(b))
    .map(dia => ({
      dia,
      rangos: map[dia].sort((a,b) => (a.horaInicio > b.horaInicio ? 1 : -1))
    }));
};

export default function DisponibilidadQuickView({ isOpen, onClose, profesionalId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [items, setItems]   = useState([]);

  useEffect(() => {
    let mounted = true; // flag para evitar setState luego del unmount
    const fetchData = async () => {
      if (!isOpen || !profesionalId) return; // no hago nada si el modal está cerrado o falta el id
      try {
        setLoading(true);
        setError('');
        const data = await listDisponibilidadesByProfesional(profesionalId); // pido disponibilidades al backend
        if (!mounted) return;
        setItems(Array.isArray(data) ? data : []); // normalizo a array
      } catch (err) {
        if (!mounted) return;
        setError('No se pudo cargar la disponibilidad.'); // mensaje genérico de error
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; }; // limpio el flag al desmontar
  }, [isOpen, profesionalId]);

  const dias = useMemo(() => agruparYOrdenar(items), [items]); // memoizo el agrupamiento/orden

  if (!isOpen) return null; // no renderizo nada si el modal no está abierto

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop show" />

      {/* Modal */}
      <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Disponibilidad del profesional</h5>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {!profesionalId && (
                <div className="text-muted">Seleccioná un profesional.</div>
              )}

              {loading && (
                <div className="d-flex align-items-center gap-2">
                  <div className="spinner-border spinner-border-sm" role="status" />
                  <span>Cargando...</span>
                </div>
              )}

              {!!error && (
                <div className="alert alert-danger py-2">{error}</div>
              )}

              {!loading && !error && profesionalId && items.length === 0 && (
                <div className="text-muted">Sin disponibilidades registradas para este profesional.</div>
              )}

              {!loading && !error && dias.length > 0 && (
                <div className="list-group">
                  {dias.map(({ dia, rangos }) => (
                    <div key={dia} className="list-group-item">
                      <div className="fw-semibold mb-1 text-capitalize">{dia}</div>
                      <ul className="mb-0 ps-3">
                        {rangos.map((r) => (
                          <li key={`${r._id || `${r.horaInicio}-${r.horaFin}`}`}>
                            {r.horaInicio} a {r.horaFin}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* -----------------------------------------
   Imports y props (qué es cada cosa)
   - listDisponibilidadesByProfesional: service que trae los rangos de disponibilidad del profesional por ID.
   - DIAS_ORDEN: array con los nombres de los días en el orden estándar de visualización.
   - idxDia(d): helper que obtiene el índice de un día dentro de DIAS_ORDEN.
   - agruparYOrdenar(items): helper que agrupa por día y ordena los rangos por horaInicio (ascendente).
   - isOpen (prop): controla si el modal está visible.
   - onClose (prop): callback para cerrar el modal.
   - profesionalId (prop): ID del profesional cuyas disponibilidades se listan.
----------------------------------------- */

