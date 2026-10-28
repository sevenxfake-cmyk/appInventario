# SENATI — Inventario React + Bootstrap

Frontend para el proyecto de inventario con Dashboard, Categorías, Proveedores, Productos y Kardex.

## Producción (Vercel)

Cuando se publica en Vercel **sin configurar una URL HTTPS para la API** mediante `VITE_API_URL`, se activa un **modo demostración claramente identificado**. Los productos y movimientos de ejemplo se guardan en `localStorage`, por lo que funcionan solo en ese navegador, no son una base MySQL compartida y pueden perderse si se borran los datos del navegador.

El modo demostración incorpora CRUD de categorías, proveedores y productos, y movimientos Kardex con actualización simultánea de las existencias. Los gráficos del Dashboard se calculan a partir de estos datos de demostración.

El archivo `vercel.json` permite abrir rutas internas de React Router directamente.

## Modo real con MySQL

Para utilizar datos reales de forma compartida en Internet es necesario publicar el backend `miApi` con una base de datos MySQL accesible desde ese backend, proteger las rutas con autenticación y configurar en Vercel:

```
VITE_API_URL=https://URL-HTTPS-REAL-DE-TU-API
```

Luego volver a desplegar el frontend. No uses `localhost:3006` como URL de API en Vercel: ese localhost sería el de cada visitante.

## Uso local en la PC de SENATI

En `localhost` la aplicación usa el backend real `http://localhost:3006` por defecto y NO entra en modo demo.

1. Ejecutar MySQL y la API del repositorio `miApi` (rama `feature/inventario-relacional`).
2. En el frontend: `npm install` y `npm run dev`.
3. Abrir `http://localhost:5173`.

## Tecnologías

React, Vite, Bootstrap 5, react-router-dom y Axios. Sin dependencia adicional de gráficos: las barras y tarjetas están construidas con Bootstrap y CSS.
