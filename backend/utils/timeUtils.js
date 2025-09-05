// utils/timeUtils.js
// Helpers de hora/fecha que se usan en varios controllers

const DIAS_ES = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];

const pad2 = (s) => s?.toString().padStart(2, '0');

const toHHmm = (hhmm) => {
  if (!hhmm) return '';
  const [h, m='00'] = String(hhmm).split(':');
  return `${pad2(h)}:${pad2(m)}`;
};

const toMinutes = (hhmm) => {
  if (!hhmm) return -1;
  const [h, m='0'] = String(hhmm).split(':').map(Number);
  return (h * 60) + (m || 0);
};

// Día de la semana en ES usando UTC (evita corrimientos)
const weekdayEsUTC = (dateLike) => {
  const d = new Date(dateLike);
  return DIAS_ES[d.getUTCDay()];
};

// Dado un HH:mm y una lista de rangos {horaInicio, horaFin}, retorna true si cae en alguno
const horaDentroDeRangos = (hhmm, rangos=[]) => {
  const val = toMinutes(toHHmm(hhmm));
  return rangos.some(r => {
    const ini = toMinutes(toHHmm(r.horaInicio));
    const fin = toMinutes(toHHmm(r.horaFin));
    return val >= ini && val < fin;
  });
};

// Para mensajes cuando hay múltiples rangos
const rangesLabel = (list=[]) =>
  list.map(r => `${toHHmm(r.horaInicio)} - ${toHHmm(r.horaFin)}`).join(', ');

module.exports = {
  toHHmm,
  toMinutes,
  weekdayEsUTC,
  horaDentroDeRangos,
  rangesLabel,
};
