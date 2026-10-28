# Laboratorio #8 — Frontend React y API REST

Frontend del Laboratorio #8 de **Full Stack Developer Software — Seminario IA 501**.

Se conecta al backend [miApi](https://github.com/sevenxfake-cmyk/miApi) (Laboratorio #7, ampliado en el paso 7 del Laboratorio #8). **Este repositorio contiene solamente el frontend.**

## Pasos de la guía implementados

- **Paso 2:** importación de Bootstrap en `src/main.jsx`.
- **Paso 3:** conexión Axios al backend en `src/services/api.js`.
- **Paso 4:** componente `src/components/Productos/crudProductos.jsx` con formulario, listado, edición y eliminación.
- **Paso 5:** integración en `src/App.jsx` con barra de navegación «SENATI - React CRUD API Rest».
- **Paso 7:** rutas GET, POST, PUT y DELETE de `/productos` agregadas al `index.js` del repositorio backend `miApi`.

## Tecnologías

React, Vite, Axios y Bootstrap; backend independiente Node.js + Express + Sequelize + MySQL.

## En la PC de SENATI

1. Clonar ambos repositorios: `miApi` y `appInventario`.
2. En HeidiSQL/MySQL, configurar la base `APIDB` y crear el archivo local `miApi/.env` con credenciales `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` y opcionalmente `PORT=3006`. No subir contraseñas a GitHub.
3. En `miApi`, ejecutar `npm install` y `npm run dev`. El puerto predeterminado del código es 3006; una variable `PORT` local lo puede sobrescribir.
4. En `appInventario`, ejecutar `npm install` y `npm run dev`. Vite mostrará la URL (normalmente `http://localhost:5173`).
5. Abrir React, probar registrar, listar, editar y eliminar productos.
6. Verificar registros en HeidiSQL y probar GET/POST/PUT/DELETE con Postman.

La URL del backend en React puede configurarse mediante `VITE_API_URL` (ver `.env.example`). Sin esa variable, React usa `http://localhost:3006`.

## Entrega

Documentar en PDF las capturas de código, terminal sin errores, navegador, HeidiSQL y Postman, según la guía del instructor.

> Código subido a GitHub; instalación y pruebas de ejecución pendientes para la PC de SENATI.
