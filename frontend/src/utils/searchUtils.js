// Helpers de texto para búsquedas simples: normalización y verificación de inclusión parcial entre campos.

// Normaliza strings para comparar: trim, minúsculas y sin acentos.
export const normalize = (s) =>
  (s ?? '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

// Devuelve true si el query está incluido en alguno de los campos (strings).
export const includesSome = (query, fields = []) => {
  const q = normalize(query);
  if (!q) return true;
  return fields.some((f) => normalize(f).includes(q));
};
