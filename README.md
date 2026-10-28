# Laboratorio #8 — Frontend React y API REST

Frontend del Laboratorio #8 de **Full Stack Developer Software — Seminario IA 501**.

Se conecta al backend independiente [miApi](https://github.com/sevenxfake-cmyk/miApi) desarrollado en el Laboratorio #7. **Este repositorio solo contiene el frontend**.

## Tecnologías
React, Vite, Axios y Bootstrap.

## Estructura
- `src/components/Productos/crudProductos.jsx`: formulario y tabla CRUD.
- `src/services/api.js`: cliente Axios para consumir la API.
- `src/App.jsx`: integra la pantalla de gestión.
- `src/main.jsx`: arranque de React e importación de Bootstrap.
- `.env.example`: URL de ejemplo para el backend.

## En la PC del laboratorio
1. Tener MySQL activo y la base `APIDB` configurada en `miApi`.
2. Verificar que el backend `miApi` tenga las rutas GET, POST, PUT y DELETE en `/productos` y se ejecute en `http://localhost:3006`. Las rutas CRUD **no forman parte del Laboratorio #7 original** y deben agregarse en ese repositorio como parte del Laboratorio #8.
3. En `miApi`, ejecutar `npm install` y `npm run dev`.
4. Clonar este repositorio y ejecutar `npm install` y `npm run dev`.
5. Abrir la URL que Vite imprima (normalmente `http://localhost:5173`) y probar el CRUD.
6. Revisar los datos en HeidiSQL y realizar las pruebas de Postman.

La URL del backend es configurable mediante `VITE_API_URL` (ver `.env.example`); si no se configura, usa `http://localhost:3006`.

## Entrega
Documentar capturas del código, terminal, navegador, HeidiSQL y Postman en un PDF según la guía del instructor.

> El código se entrega sin instalación ni pruebas locales previas; la ejecución está pendiente en la PC de SENATI.
