# Inventario relacional — Frontend React (SENATI)

Ampliación de appInventario con react-router-dom y panel administrativo.
Se conecta al backend miApi en http://localhost:3006.

## Vistas
- Inicio: indicadores de productos, bajo stock (5 o menos), categorías, proveedores y movimientos.
- Productos: formulario con select dinámico de categorías y proveedores. No permite cambiar stock directamente.
- Categorías: CRUD.
- Proveedores: CRUD.
- Kardex: Entrada, Salida y Ajuste, con tabla de historial y responsable.

## Cómo probar en SENATI
1. Guarda un respaldo de APIDB en HeidiSQL antes de cambiar el esquema.
2. En miApi, selecciona la misma rama feature/inventario-relacional, ejecuta npm install y npm run migrate.
3. Añade ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD en el .env local y ejecuta npm run seed:admin.
4. Inicia miApi con npm run dev (puerto 3006).
5. En este frontend ejecuta npm install y npm run dev (puerto 5173).
6. Crea categorías, productos y realiza movimientos para ver los cambios de stock y el Dashboard.
7. Comprueba en HeidiSQL las tablas categorias, proveedores, usuarios, movimientos y Productos.

No hay login todavía; usuario responsable no verifica identidad. Autenticación y protección de rutas quedan como investigación futura, conforme al enunciado.

Se trata de código preparado sin ejecución ni pruebas en la máquina del usuario.
