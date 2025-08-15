**Genaro Weis**
Tecnicatura Universitaria en Programacion - UTN FRBB
Practica Profesional Supervisada (PPS)

<!-- ```bash -->

#  Sistema de Gestión de Turnos

Este proyecto corresponde al backend de una aplicación para la **gestión de turnos**, orientada a consultorios, peluquerías u otros servicios con atención por agenda para uso exclusivo de un **administrador** (NO esta diseñada para interactuar con el publico).

---

## 📬 Colección Postman - API Turnero

Esta colección contiene **todas las rutas del sistema** (Clientes, Profesionales, Turnos y Disponibilidades), incluye:

- 4 carpetas con los endpoints de cada entidad
  - ✔️ Casos exitosos 
  - ❌ Casos de error controlado por validaciones y reglas de negocio

(hay carpetas que tienen aclaraciones en su descripcion para casos de redundancia, etc)

### 📥 ¿Cómo usar la colección?

1. **Descargá el archivo Postman** desde este enlace:

   👉 https://drive.google.com/file/d/1A-GFdV4VJJesB9GQl1j2NafCav8P5iI8/view?usp=sharing

2. Abrí **Postman**:
   - Hacé clic en el botón **"Import"**
   - Elegí la opción **"Archivo"**
   - Seleccioná el `.json` descargado

---

### 📋 Validaciones Backend 

Todas las validaciones de entrada son gestionadas con `express-validator`, y reforzadas con reglas de negocio implementadas en los controladores del backend.


A continuación se detallan todas las validaciones aplicadas para cada entidad del sistema.

---
#### 👤 Profesionales

###### POST `/profesionales`

- `nombre`: obligatorio, mínimo 2 caracteres, solo letras y espacios.
- `especialidad`: obligatoria, tipo texto.
- `email`: obligatorio, debe ser un email válido.
- `telefono`: obligatorio, solo números, entre 8 y 15 dígitos.

###### PUT `/profesionales/:id`

- `id`: obligatorio (en URL), debe ser un ID de MongoDB válido.
- Campos opcionales pero validados si se envían:
  - `nombre`: mínimo 2 caracteres, solo letras y espacios.
  - `especialidad`: texto.
  - `email`: email válido.
  - `telefono`: solo números, entre 8 y 15 dígitos.

###### GET / DELETE `/profesionales/:id`
- `id`: obligatorio (en URL), debe ser un ID de MongoDB válido.

---
#### Clientes

###### POST `/clientes`

- `nombre`: obligatorio, mínimo 2 caracteres, solo letras y espacios.
- `apellido`: obligatorio, mínimo 2 caracteres, solo letras y espacios.
- `email`: obligatorio, debe ser un email válido.
- `telefono`: obligatorio, solo números, entre 8 y 15 dígitos.
- `dni`: opcional, numérico, entre 7 y 9 dígitos.
- `direccion`: opcional, texto.

###### PUT `/clientes/:id`

- `id`: obligatorio (en URL), debe ser un ID de MongoDB válido.
- Campos opcionales pero validados si se envían:
  - `nombre`, `apellido`: mínimo 2 caracteres, solo letras y espacios.
  - `email`: email válido.
  - `telefono`: solo números, entre 8 y 15 dígitos.
  - `dni`: numérico, entre 7 y 9 dígitos.
  - `direccion`: texto.

###### GET / DELETE `/clientes/:id`
- `id`: obligatorio (en URL), debe ser un ID de MongoDB válido.

---

#### Disponibilidades
"agregado: GET by id profesional"

###### POST `/disponibilidad`
- `diaSemana`: obligatorio. Debe ser uno de:  
  `"lunes"`, `"martes"`, `"miércoles"`, `"jueves"`, `"viernes"`, `"sábado"`, `"domingo"`.
- `horaInicio`: obligatorio. Formato `HH:MM` (24h).
- `horaFin`: obligatorio. Formato `HH:MM` (24h).
- `profesional`: obligatorio. ID de MongoDB válido.

*Reglas adicionales (controlador):*
- `horaInicio` debe ser menor que `horaFin`.
- No se permite duplicar exactamente el mismo rango horario en un día.
- No se permite superposición entre rangos horarios de un mismo profesional.

###### PUT `/disponibilidad/:id`
- `id`: obligatorio (en URL), debe ser un ID de MongoDB válido.
- Campos opcionales pero validados si se envían:
  - `diaSemana`: debe ser válido.
  - `horaInicio`, `horaFin`: formato `HH:MM` (24h).
  - `profesional`: ID válido de MongoDB.

###### GET `/disponibilidad/profesional/:profesionalId`
- `profesionalId`: obligatorio, debe ser un ID válido de MongoDB.

###### GET / DELETE `/disponibilidad/:id`
- `id`: obligatorio (en URL), debe ser un ID de MongoDB válido.
---
#### Turnos

###### POST `/turnos`
- `fecha`: obligatorio. Formato `YYYY-MM-DD`.
- `hora`: obligatorio. Formato `HH:MM` (24h).
- `profesional`: obligatorio. ID válido de MongoDB.
- `cliente`: obligatorio. ID válido de MongoDB.
- `estado`: opcional. Debe ser uno de: `"pendiente"`, `"confirmado"`, `"cancelado"`.

*Reglas adicionales (controlador):*
- No se puede agendar un turno duplicado (mismo profesional, fecha y hora).
- El profesional y el cliente deben existir.
- El profesional debe tener disponibilidad registrada para ese día.
- La hora del turno debe estar dentro del rango disponible del profesional.

###### PUT `/turnos/:id`
- `id`: obligatorio (en URL), debe ser un ID válido de MongoDB.
- Campos opcionales pero validados si se envían:
  - `fecha`: formato válido `YYYY-MM-DD`.
  - `hora`: formato `HH:MM` (24h).
  - `profesional`, `cliente`: ID válidos.
  - `estado`: debe ser `"pendiente"`, `"confirmado"` o `"cancelado"`.

###### GET / DELETE `/turnos/:id`
- `id`: obligatorio (en URL), debe ser un ID de MongoDB válido.

---

#### Consideraciones adicionales

- Todos los errores de validación retornan `400 Bad Request` con mensajes detallados por campo.
- Las validaciones de unicidad (como turnos duplicados o solapamiento de disponibilidad) se manejan con lógica en el controlador.
- Todos los IDs referenciados deben ser válidos de MongoDB (24 caracteres hexadecimales).
- Los campos de texto se limpian con `.trim()` para evitar entradas vacías o con solo espacios.

---



front:
explicar el funcionamiento del front
axios, etc
explicar como funcionan las pages y sus detalles (fetchData() trae la lista cuando entra a la página.
handleDelete() usa window.confirm (simple y suficiente para MVP).
Usamos mensajes alert para éxito/error. Después podemos cambiar por toasts.)
esta la page y la pageform, esta segunda abre un formulario para crear y editar si reconoce el "id" edita si no crea























---

## 📁 Estructura del Proyecto

/backend
│
├── controllers/ # Lógica de cada entidad (CRUD y validaciones)
├── models/ # Esquemas Mongoose (Profesional, Cliente, Turno, Disponibilidad)
├── routes/ # Endpoints agrupados por entidad
├── .env # Variables de entorno (PORT, MONGO_URI)
├── server.js # Configuración principal del servidor Express
└── package.json # Dependencias y scripts

## 🧱 Tecnologías Utilizadas

- Node.js
- Express
- MongoDB + Mongoose
- dotenv
- cors
- nodemon

---

## 🔌 Instalación y Ejecución Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/usuario/backend-turnos.git
cd backend-turnos

## Instalar dependencias
npm install express mongoose dotenv cors nodemon

## env example
PORT=5000
MONGO_URI=mongodb://localhost:27017/turnos

## iniciar el servidor
npm run dev 
(desde el backend cd backend)

## 📦 Endpoints de la API
🔹 Profesionales
GET /api/profesionales → Listar todos

GET /api/profesionales/:id → Ver uno

POST /api/profesionales → Crear nuevo

PUT /api/profesionales/:id → Editar

DELETE /api/profesionales/:id → Eliminar

🔹 Clientes
GET /api/clientes

GET /api/clientes/:id

POST /api/clientes

PUT /api/clientes/:id

DELETE /api/clientes/:id

🔹 Turnos
GET /api/turnos → Lista con profesional y cliente

GET /api/turnos/:id

POST /api/turnos → Requiere validación de disponibilidad

PUT /api/turnos/:id

DELETE /api/turnos/:id

🔹 Disponibilidades
GET /api/disponibilidad

GET /api/disponibilidad/:id

POST /api/disponibilidad → Valida formato, solapamiento y duplicados

PUT /api/disponibilidad/:id

DELETE /api/disponibilidad/:id


##📬 Postman
Se incluye una colección exportada de Postman con todos los endpoints organizados para pruebas:

📁 postman/coleccion-api-sistema-turnos.json

Cobertura de errores y validaciones

## 🗺️ Diagrama Entidad-Relación
Disponible en la carpeta docs/:

📄 docs/diagrama-er.png

Incluye:

Profesional

Cliente

Turno

DisponibilidadHoraria

Relaciones:

Un profesional puede tener muchas disponibilidades

Un turno pertenece a un cliente y un profesional

Un turno debe coincidir con una disponibilidad

##🚀 Despliegue (pendiente)
El backend será desplegado en Render.com, y su URL será incluida aquí una vez configurada:

arduino
Copiar
🔗 https://nombre-del-proyecto.onrender.com

## 📋 Requisitos previos

Para ejecutar este backend localmente, necesitás tener instalado:

### 🔹 Node.js y npm
Descargalos desde: [https://nodejs.org/](https://nodejs.org/)

### 🔹 MongoDB Community Edition (instalación local)

Este proyecto utiliza MongoDB **de forma local**.

1. Descargá MongoDB Community Server desde:  
   👉 [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

2. Durante la instalación, seleccioná:
   - Configuración completa ("Complete")
   - **MongoDB Compass**: dejá marcada la opción si querés una interfaz visual

3. Una vez instalado, iniciá MongoDB en una terminal:
   ```bash
   mongod