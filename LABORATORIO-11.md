# Laboratorio #11 — React: autenticación JWT y rutas protegidas

Guía SENATI: Frontend con React: Autenticación JWT y Rutas Protegidas. Esta rama desarrolla Lab. #11 encima del trabajo de Lab. #10, sin borrar las pantallas de inventario.

## Implementación

- React Router ya estaba instalado (`react-router-dom`).
- `src/pages/Login.jsx`: formulario de inicio de sesión que realiza `POST /api/auth/login`.
- `src/services/auth.js`: sesión en `sessionStorage`, verificación local de expiración del token y cierre de sesión.
- `src/services/api.js`: interceptor Axios que adjunta automáticamente `Authorization: Bearer TOKEN` en las llamadas a la API real y elimina la sesión ante HTTP 401.
- `src/components/ProtectedRoute/ProtectedRoute.jsx`: protege todas las páginas de inventario; sin sesión redirige a `/login`.
- `src/App.jsx`: ruta pública `/login`, rutas privadas del Dashboard, productos, categorías, proveedores y Kardex, y botones para salir.

**Importante:** la protección frontend no reemplaza la validación JWT de miApi. La guía propone `localStorage`; usamos `sessionStorage` deliberadamente para evitar persistir el token después de cerrar la pestaña. Ningún almacenamiento accesible a JavaScript es totalmente inmune a XSS.

## Ejecutar en la computadora

Backend (repositorio miApi, rama `feature/laboratorio-10-seguridad`):
```powershell
npm install
npm run migrate
npm run dev
```
Verificar que MySQL esté encendido y que `.env` tenga `JWT_SECRET` generado localmente (32+ caracteres), la conexión a APIDB y `CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`.

Frontend (este repositorio y la misma rama):
```powershell
npm install
npm run dev
```
Abrir `http://localhost:5173/login`. Para un nuevo usuario, realizar `POST http://localhost:3006/api/auth/register` desde Postman o utilizar un administrador creado con `npm run seed:admin`.

La API real está en `localhost:3006` y Axios usa `/api` automáticamente. No cambiar las rutas existentes a `/api/api` ni modificar el stock desde el formulario de productos: se actualiza por Kardex. Para eliminar registros, usar una cuenta Administrador.

## Capturas para la entrega PDF

1. Terminal con MySQL/backend (3006) y frontend (5173) sin errores.
2. HeidiSQL con la tabla usuarios y hash de contraseña, ocultando datos confidenciales.
3. Página `/login` y login correcto con usuario registrado.
4. Abrir `/productos` sin sesión y demostrar redirección a `/login`.
5. Desde DevTools/Network, petición de productos con encabezado Bearer (ocultar valor real del token).
6. CRUD desde la web: guardar, editar y eliminar producto sin movimientos, con cuenta Administrador.
7. Postman: GET sin JWT (401), con JWT (200), POST (201), PUT (200), DELETE (200) y una prueba de token inválido (401).
8. Cierre de sesión: volver a `/productos` debe llevar al login.

El modo demostración público sin backend HTTPS utiliza datos locales; **no** constituye una prueba de MySQL/JWT. Las comprobaciones de extremo a extremo quedan pendientes de ejecutarse en la PC con la base de datos.
