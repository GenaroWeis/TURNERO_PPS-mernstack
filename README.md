# 🗓️ Sistema de Gestión de Turnos (Turnero MERN)

**Autor:** Genaro Weis  
**Carrera:** Tecnicatura Universitaria en Programación – UTN FRBB  
**Proyecto:** Práctica Profesional Supervisada (PPS)  

---

## 📖 Descripción general

Este proyecto corresponde a una aplicación para la **gestión de turnos**, orientada a consultorios, peluquerías u otros servicios con atención por agenda para uso exclusivo de un **administrador** (no está diseñada para clientes finales).

### 🎯 Objetivo
Permitir a un administrador asignar turnos, registrar profesionales, gestionar sus disponibilidades horarias y cargar clientes.

### 🏷️ Ejemplo de uso
En un salón de belleza, se cargan los distintos profesionales (estilista, colorista, etc.), sus horarios disponibles y los clientes que solicitan turnos. Luego el administrador agenda el turno y lo gestiona cambiando su estado (**pendiente**, **confirmado**, **cancelado**).

---

## 🛠️ Tecnologías utilizadas

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- express-validator
- dotenv
- cors
- nodemon

### Frontend
- React
- axios
- react-router-dom
- Bootstrap 5

### Herramientas
- Postman (colección incluida)
- Git y GitHub
- Visual Studio Code

---

## 📂 Estructura del proyecto

### Backend
```
/backend
 ├── models/           # Esquemas de Mongoose (Cliente, Profesional, Turno, Disponibilidad)
 ├── controllers/      # Lógica de negocio y respuestas JSON
 ├── routes/           # Rutas REST agrupadas por recurso
 ├── validators/       # Validaciones con express-validator
 ├── middleware/       # Middlewares (validateRequest)
 ├── utils/            # Helpers de horas, fechas, errores
 └── server.js         # Configuración principal del servidor
```

### Frontend
```
/frontend
 ├── src/
 │   ├── components/   # Componentes reutilizables (InputField, HoraSelect, QuickView, etc.)
 │   ├── hooks/        # Lógica reutilizable relacionada con el estado y el manejo de datos
 │   ├── pages/        # Páginas principales (Home, Turnos, Disponibilidades, Clientes, Profesionales)
 │   ├── services/     # Servicios API (Axios)
 │   ├── utils/        # Funciones auxiliares (errores, fechas, horarios)
 │   ├── styles/       # Archivos CSS personalizados
 │   └── App.js        # Rutas principales
```

---

## ⚙️ Instalación y puesta en marcha (local)

### Requisitos previos
- Node.js  
- NPM  
- MongoDB  
- Archivo `.env` en backend y frontend  

##### levantar Mongo a nivel local 
 ```bash 
#CMD
mongod
```
##### clonar el repositorio
```bash 
#Clonar el repo
git clone <URL-DEL-REPO>
cd <carpeta-del-repo>
```
##### instalar dependencias y levantar
```bash 
#Backend
cd backend
npm install
npm run dev #levantar el sv
#Frontend
cd frontend
npm install
npm start #levantar el sv
```
---

## 📬 Colección Postman

La colección incluye todas las rutas del sistema (Clientes, Profesionales, Turnos y Disponibilidades) con casos exitosos y casos de error por validaciones y reglas de negocio.

1. **Descargá el archivo Postman** desde este enlace:  
   👉 [Descargar colección](https://drive.google.com/file/d/1A-GFdV4VJJesB9GQl1j2NafCav8P5iI8/view?usp=sharing)

2. **Importar en Postman**  
   - Abrí Postman  
   - Clic en **"Import"**  
   - Seleccioná el archivo `.json` descargado  

---

## 💬 Comentarios en el código

Gran parte de la documentación se encuentra en los **comentarios dentro del código**:

- el codigo se encuentra comentado a profundidad desde el back al front 
- Los **controllers** se documentan principalmente en *Profesionales* y *Clientes*, ya que el resto extiende esa lógica.  
- Las **pages** siguen la misma lógica: las básicas (*Profesionales* y *Clientes*) están comentadas en detalle.  
- Cada módulo adicional (*components, hooks, utils*) contiene comentarios explicativos de su funcionamiento.  

---

## 🔄 Flujo de uso

1. Registrar profesionales  
2. Cargar disponibilidades para cada profesional  
3. Registrar clientes  
4. Asignar un turno (validando disponibilidad)  
5. Confirmar o cancelar turnos según corresponda  

---

## 🗄️ Backend

### Entidades y relaciones
- **Cliente**: datos personales y de contacto  
- **Profesional**: datos de los especialistas  
- **Disponibilidad**: días y horarios en que un profesional atiende  
- **Turno**: fecha, hora, estado, vinculado a un cliente y un profesional  

👉 Ver **diagrama entidad–relación** (https://drive.google.com/file/d/1b6GIoFla9w3I0r2elchnrTvyJ7oAcILu/view?usp=sharing.)

![Diagrama ER del sistema](docs/diagramaER.png)

### Validaciones

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

## 🎨 Frontend

### Páginas principales
- Profesionales (listado y formulario)  
- Clientes (listado y formulario)  
- Disponibilidades (listado y formulario)  
- Turnos (listado y formulario)  
- HomePage  

### Extras implementados
Se modularizó el código para mayor prolijidad y escalabilidad:

- DayChips  
- DayFilter  
- DisponibilidadQuickView  
- EstadoBadge  
- EstadoFilter  
- HoraSelect  
- InputField  
- Navbar  
- ProfesionalWeekView  
- Searchbar  
