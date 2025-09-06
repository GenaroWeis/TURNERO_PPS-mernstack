// Helpers de hora/fecha reutilizables: formateo "HH:mm", conversión a minutos, día de semana (UTC),
// verificación de pertenencia a rangos y labels de rangos.


const DIAS_ES = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"]; // nombres de días en ES (orden estándar)

const pad2 = (s) => s?.toString().padStart(2, '0');               // padding a 2 dígitos (09)

const toHHmm = (hhmm) => {
  if (!hhmm) return '';                                           // sin valor → cadena vacía
  const [h, m='00'] = String(hhmm).split(':');                    // si falta minuto, asumo "00"
  return `${pad2(h)}:${pad2(m)}`;                                 // normalizo a "HH:mm"
};

const toMinutes = (hhmm) => {
  if (!hhmm) return -1;                                           // indicador de inválido
  const [h, m='0'] = String(hhmm).split(':').map(Number);         // parseo seguro
  return (h * 60) + (m || 0);                                     // minutos desde 00:00
};

// Día de la semana en ES usando UTC (evita corrimientos)
const weekdayEsUTC = (dateLike) => {
  const d = new Date(dateLike);                                   // admito Date o parseable por Date
  return DIAS_ES[d.getUTCDay()];                                  // uso UTC para no desplazar el día
};

// Dado un HH:mm y una lista de rangos {horaInicio, horaFin}, retorna true si cae en alguno
const horaDentroDeRangos = (hhmm, rangos=[]) => {
  const val = toMinutes(toHHmm(hhmm));                            // normalizo y convierto a minutos
  return rangos.some(r => {
    const ini = toMinutes(toHHmm(r.horaInicio));
    const fin = toMinutes(toHHmm(r.horaFin));
    return val >= ini && val < fin;                               // intervalo semiabierto [ini, fin)
  });
};

// Para mensajes cuando hay múltiples rangos
const rangesLabel = (list=[]) =>
  list.map(r => `${toHHmm(r.horaInicio)} - ${toHHmm(r.horaFin)}`).join(', '); // "09:00 - 12:00, 14:00 - 16:00"

module.exports = {
  toHHmm,
  toMinutes,
  weekdayEsUTC,
  horaDentroDeRangos,
  rangesLabel,
};

/* -----------------------------------------
   Imports y props
   - (sin imports): utilidades puras de fecha/hora para Node (CommonJS).
   - DIAS_ES: array con los nombres de los días en español en el orden estándar.
   - Exporta: { toHHmm, toMinutes, weekdayEsUTC, horaDentroDeRangos, rangesLabel }.
----------------------------------------- */
