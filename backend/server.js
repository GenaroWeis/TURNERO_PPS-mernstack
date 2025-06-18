const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error("Error conectando a MongoDB:", err));

//RUTAS
const profesionalRoutes = require("./routes/profesionalRoutes.js");
const clienteRoutes = require("./routes/clienteRoutes");
const turnoRoutes = require("./routes/turnoRoutes");
const disponibilidadRoutes = require("./routes/disponibilidadRoutes");

app.use("/api/profesionales", profesionalRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/turnos", turnoRoutes);
app.use("/api/disponibilidad", disponibilidadRoutes);

app.get('/', (req, res) => {
  res.send('API funcionando');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
