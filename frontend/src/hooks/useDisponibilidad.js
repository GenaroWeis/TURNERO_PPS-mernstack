// Hook para obtener y normalizar la disponibilidad de un profesional: hace fetch, normaliza horas a "HH:MM",
// agrupa por día y expone utilidades para render (mapa por día, set de días, flags de carga y error).

import { useEffect, useMemo, useState } from 'react';
import { listDisponibilidadesByProfesional } from '../services/disponibilidadService';
import { normalizeDia, toHHmm } from '../utils/scheduleUtils';

export default function useDisponibilidad(profesionalId) {
  const [items, setItems] = useState([]);     // rangos crudos (normalizados) tal como vienen del service
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true; // evito setState cuando el componente ya se desmontó
    const run = async () => {
      if (!profesionalId) { setItems([]); setError(''); return; } // si no hay id, limpio y corto
      try {
        setLoading(true); setError('');
        const data = await listDisponibilidadesByProfesional(profesionalId); // fetch al backend
        if (!mounted) return;
        // Normalizo horas a "HH:MM" para asegurar formato consistente en toda la app
        const norm = (Array.isArray(data) ? data : []).map(d => ({
          ...d,
          diaSemana: d.diaSemana,
          horaInicio: toHHmm(d.horaInicio),
          horaFin: toHHmm(d.horaFin),
        }));
        setItems(norm);
      } catch (e) {
        if (!mounted) return;
        setError('No se pudo cargar la disponibilidad');
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; }; // cleanup del flag
  }, [profesionalId]);

  // Mapa por día normalizado → lista de rangos [{horaInicio, horaFin, _id}, ...]
  const byDay = useMemo(() => {
    const m = new Map();
    items.forEach(d => {
      const key = normalizeDia(d.diaSemana); // clave canónica del día
      const arr = m.get(key) || [];
      arr.push({ horaInicio: d.horaInicio, horaFin: d.horaFin, _id: d._id }); // guardo solo lo necesario para UI
      m.set(key, arr);
    });
    // Ordeno cada lista por horaInicio para una visual consistente
    m.forEach((arr) => arr.sort((a,b) => (a.horaInicio > b.horaInicio ? 1 : -1)));
    return m;
  }, [items]);

  // Conjunto de días disponibles (claves del mapa)
  const availableDaysSet = useMemo(() => new Set(Array.from(byDay.keys())), [byDay]);

  return { items, byDay, availableDaysSet, loading, error }; // shape estable para consumir en componentes
}

/* -----------------------------------------
   Imports y props
   - listDisponibilidadesByProfesional: service que obtiene las disponibilidades por ID de profesional.
   - normalizeDia: helper que normaliza el nombre del día para usarlo como clave estable.
   - toHHmm: helper que formatea horas a "HH:MM".
   - profesionalId (arg): ID del profesional cuyas disponibilidades se consultan.
   - Retorna: { items, byDay (Map), availableDaysSet (Set), loading (bool), error (string) }.
----------------------------------------- */
