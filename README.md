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
- `especialidad`: obligatoria, tipo texto, mínimo 1 letra.
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


BACKEND: explicar que en disponibilidad se ponen los dias de la semana y horarios disponibles de un profesional
y cuando uno busca un turno se hace una conversion para ver si ese dia de la semana en ese horario se va a a encontrar disponible
"tengo que agregar alguna referencia para que el usser sepa que en el formato dd/mm/yy el dia que elija atine con las disponibilidades de un profecional, por ahora deje el calendario como para guiarse"


#### FORMATO "BASE DE DATOS PARA UN GESTOR DE TURNOS USO ADMINISTRATIVO"
El programa es como si fuese una agenda para registrar turnos, un administrador se encarga de manejarlo
tiene cargados todos sus profesionales
las disponibilidades de cada profesional
los clientes que llegan son registrados tambien
y se asigna un turno en base a la disponibilidad
cuando el cliente viene al turno el administrador le consulta por que turno vino
lo chequea en la base de datos
y cambia el estado a confirmado


POR EJEMPLO: salon de belleza
-tengo distintos profesionales(estilista, colorista etc)
- cuando viene el cliente quiere agendar un turno
-se lo registra en la base de datos
-se agenda con un profesional de los que ya estan cargados
-


la logica de funcionamiento del front esta documentada en base a comentarios en los codigos de profesionales, se utilizo la misma para todos



parseApiErrors es una función de utilidad que toma un error que vino del backend  y lo transforma en un formato que React puede mostrar en los formularios.
En lugar de mostrar solo un alert default como "Ocurrió un error", esta función nos devuelve un objeto con claves por campo del formulario y valores con los mensajes de error que se validan en el backend


---------------------------------------------------------------------------------------------------------

COMPONENTS;Contiene los componentes de interfaz reutilizables de la aplicación (inputs, filtros, badges, modales, barras de navegación, etc.). Cada componente está escrito como función con props controladas, maneja estados visuales (loading/errores) y prioriza accesibilidad básica (labels, aria-*, title). La idea es mantener una UI consistente, fácil de testear y de componer en páginas más grandes, evitando duplicación de lógica y estilos.

 -DayChips: renderiza una tira de badges para los días de la semana y marca en verde aquellos con disponibilidad, usando availableDaysSet (días normalizados) para la verificación. Ideal para mostrar disponibilidad rápida en pantallas de agenda/turnos.

-DisponibilidadQuickView muestra en un modal la disponibilidad de un profesional, agrupada por día según un orden canónico y ordenada por hora de inicio. Hace fetch por profesionalId, maneja estados de carga/error y lista los rangos horarios de cada día. Ideal como vista rápida desde pantallas de turnos o de detalle de profesional.

-EstadoBadge muestra una etiqueta visual del estado de un turno. Mapea confirmado (verde), cancelado (rojo) y, por defecto, pendiente (gris), aplicando clases utilitarias para el color. Ideal para listas y detalles de turnos.

-EstadoFilter renderiza un <select> controlado para filtrar turnos por estado. Expone value y onChange para que el componente padre maneje el estado del filtro y reaccione a los cambios del usuario. Ideal para listas con paginación/búsqueda.

-HoraSelect construye un <select> de horarios a partir de rangos diarios. Une las franjas en intervalos de 30 minutos, muestra un mensaje contextual de disponibilidad y deshabilita el control cuando no hay opciones. Ideal para formularios de alta/edición de turnos. 

-InputField es un componente de formulario reutilizable para entradas de texto controladas. Muestra label vinculado, aplica estilo de error y feedback cuando error tiene contenido, y admite placeholder, type y disabled. Ideal para formularios consistentes con validaciones.

-Navbar define la barra superior de navegación con enlaces internos a Inicio, Turnos, Clientes, Profesionales y Disponibilidad mediante NavLink, manteniendo la navegación como SPA y resaltando la ruta activa.

-SearchBar provee una barra de búsqueda controlada con un input de texto y un filtro de fecha opcional. Expone callbacks para sincronizar el estado en el componente padre y permite personalizar etiqueta y placeholder. Ideal para listas con filtros combinados.

------------------------------ x ------------------------ x ------------------------ x ----------------------

HOOKS:Contiene hooks personalizados que encapsulan lógica reutilizable relacionada con el estado y el manejo de datos. Estos hooks abstraen llamadas a servicios, normalización de datos y cálculos derivados (por ejemplo, disponibilidades agrupadas por día), para que los componentes se mantengan simples y enfocados en la presentación. La carpeta centraliza comportamientos comunes y permite compartirlos fácilmente entre diferentes vistas de la aplicación. 

-useDisponibilidad obtiene las disponibilidades de un profesional, normaliza las horas a HH:MM, agrupa por día (clave normalizada) y expone byDay, availableDaysSet, loading y error para facilitar el render en componentes como listas, chips y selects de horarios.

------------------------------ x ------------------------ x ------------------------ x ----------------------

UTILS:

-dateUtils: formatFecha(iso) devuelve la fecha en formato local DD/MM/AAAA (es-AR) con fallback "-", y toYYYYMMDD(iso) extrae YYYY-MM-DD desde un ISO/Date para comparaciones exactas entre fechas. Ideal para normalizar la presentación y lógica de fechas en la app.

-parseApiErrors(error) convierte respuestas de error de Axios en un objeto uniforme listo para mostrar en formularios: mapea errores de express-validator por campo, detecta duplicados comunes (E11000/email), respeta message general del backend y, si no hay datos, retorna un fallback seguro. Ideal para centralizar el manejo de errores en el frontend.

-Utilidades de agenda y tiempo para la app: normalizeDia (normaliza nombres de días), DIAS_ORDEN (orden estándar), dayNameUTC (día de la semana desde YYYY-MM-DD en UTC), toHHmm (formatea horas), genTimeSlots (genera intervalos), unionSlots (une slots de varios rangos) y summarizeRanges (resumen mínimo–máximo para hints).

-Funciones de ayuda para búsquedas en memoria: normalize(s) estandariza texto (trim, minúsculas y sin acentos) y includesSome(query, fields) verifica si el query aparece en alguno de los campos normalizados.



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