const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

/* ====== Config ====== */
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';

const ORIGINS = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: ORIGINS.length ? ORIGINS : true, // en dev permite todo; en prod restringe
  credentials: true
}));

app.use(express.json());

/* ====== DB ====== */
mongoose.set('strictQuery', true); // evita warnings en consultas dinámicas
mongoose.connect(MONGODB_URI, {
}).then(() => {
  console.log('✅ MongoDB conectado');
}).catch(err => {
  console.error('❌ Error conectando a MongoDB:', err?.message || err);
  process.exitCode = 1;
});

/* ====== Healthcheck ====== */
app.get('/health', (_req, res) => res.status(200).send('ok'));

/* ====== Rutas ====== */
const profesionalRoutes = require('./routes/profesionalRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const turnoRoutes = require('./routes/turnoRoutes');
const disponibilidadRoutes = require('./routes/disponibilidadRoutes');

app.use('/api/profesionales', profesionalRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/disponibilidad', disponibilidadRoutes);

// Raíz informativa
app.get('/', (_req, res) => res.send('API funcionando'));

/* ====== 404 y errores ====== */
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Ruta no encontrada' });
});

app.use((err, _req, res, _next) => {
  console.error('❌ Error no controlado:', err);
  res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
});

/* ====== Start ====== */
const server = app.listen(PORT, () => {
  console.log(`🚀 API escuchando en puerto ${PORT}`);
});

/* ====== Cierre ordenado (opcional) ====== */
process.on('SIGTERM', () => {
  console.log('Recibido SIGTERM, cerrando servidor...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('Conexión Mongo cerrada.');
      process.exit(0);
    });
  });
});
