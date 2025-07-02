import { useEffect, useState } from 'react';
import { getTurnos } from '../services/turnoService';

function TurnosPage() {
  const [turnos, setTurnos] = useState([]);

  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        const data = await getTurnos();
        setTurnos(data);
      } catch (error) {
        console.error('Error al obtener turnos', error);
      }
    };

    fetchTurnos();
  }, []);

  return (
    <div>
      <h1>Listado de Turnos</h1>
      <ul>
        {turnos.map((turno) => (
          <li key={turno._id}>
            {turno.fecha} - {turno.hora} - Estado: {turno.estado}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TurnosPage;
