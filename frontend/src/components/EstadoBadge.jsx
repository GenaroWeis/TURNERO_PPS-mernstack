// Renderizo un badge con el estado de un turno (confirmado, cancelado o pendiente) con color acorde.

export default function EstadoBadge({ estado }) {
  const cls =
    estado === 'confirmado' ? 'badge bg-success' :   // verde si está confirmado
    estado === 'cancelado'  ? 'badge bg-danger'  :   // rojo si está cancelado
                               'badge bg-secondary'; // gris para pendiente u otros valores
  return <span className={cls}>{estado || 'pendiente'}</span>; // fallback a "pendiente" si no hay estado
}

/* -----------------------------------------
   Imports y props 
   - estado (prop): cadena con el estado del turno; admite "confirmado", "cancelado" o vacía/otro (se muestra como "pendiente").
----------------------------------------- */
