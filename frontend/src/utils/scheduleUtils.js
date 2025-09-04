// Utilidades de agenda/horarios: normalización de días, orden estándar, conversión de fechas/horas y generación/union de slots.

// Normaliza el nombre del día:
// - trim espacios
// - a minúsculas
// - remueve acentos (NFD)
// Ej.: " Miércoles " -> "miercoles"
export const normalizeDia = (s) =>
  s ? s.toString().trim().toLowerCase()
       .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
     : '';

// Orden de días para UI 
export const DIAS_ORDEN = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];

// Dado un string "YYYY-MM-DD", devuelve el nombre del día en español.
// Forzamos UTC con "T00:00:00Z" para evitar corrimientos de huso horario.
export const dayNameUTC = (yyyyMMdd) => {
  if (!yyyyMMdd) return null;
  const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const d = new Date(`${yyyyMMdd}T00:00:00Z`);
  return dias[d.getUTCDay()];
};

// Asegura el formato "HH:mm" (con ceros a la izquierda).
// Ej.: "9:5" -> "09:05", "9" -> "09:00"
const pad2 = (s) => s?.toString().padStart(2,'0');
export const toHHmm = (hhmm) => {
  if (!hhmm) return '';
  const [h, m='00'] = hhmm.split(':');
  return `${pad2(h)}:${pad2(m)}`;
};

// Genera slots cada 'stepMinutes' dentro del rango [horaInicio, horaFin).
// Devuelve un array de strings "HH:mm" ordenado.
// Ej.: genTimeSlots("09:00","10:30",30) -> ["09:00","09:30","10:00"]
export const genTimeSlots = (horaInicio, horaFin, stepMinutes = 30) => {
  if (!horaInicio || !horaFin) return [];
  const [hiH, hiM] = toHHmm(horaInicio).split(':').map(Number);
  const [hfH, hfM] = toHHmm(horaFin).split(':').map(Number);
  const start = hiH * 60 + hiM;
  const end   = hfH * 60 + hfM;

  const out = [];
  for (let m = start; m < end; m += stepMinutes) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    out.push(`${pad2(h)}:${pad2(mm)}`);
  }
  return out;
};

// Une los slots de varios rangos del MISMO día.
// Ej.: [{09-12}, {14-16}] -> ["09:00","09:30",...,"11:30","14:00","14:30",...,"15:30"]
export const unionSlots = (ranges, stepMinutes = 30) => {
  const set = new Set();
  (ranges || []).forEach(r => {
    genTimeSlots(r.horaInicio, r.horaFin, stepMinutes).forEach(s => set.add(s));
  });
  // Devolvemos ordenado
  return Array.from(set).sort();
};

// Devuelve un resumen simple para mostrar como hint en UI.
// Ej.: [{09-12},{14-16}] -> "09:00 - 16:00"
// (No es exacto por huecos, es un "mínimo a máximo" para orientar al usuario)
export const summarizeRanges = (ranges = []) => {
  if (!ranges.length) return null;
  const starts = ranges.map(r => toHHmm(r.horaInicio));
  const ends   = ranges.map(r => toHHmm(r.horaFin));
  const minStart = starts.sort()[0];
  const maxEnd   = ends.sort().slice(-1)[0];
  return `${minStart} - ${maxEnd}`;
};
