# appInventario — Panel administrativo SENATI

Aplicación React + Vite + Bootstrap 5 para administrar inventario mediante la API REST del repositorio **miApi**.

## Diseño actualizado

Interfaz responsive con menú lateral (en móviles se abre con el botón de menú), colores consistentes y tablas mejoradas. **No se agregaron librerías de gráficos**: los gráficos usan las barras de progreso de Bootstrap y CSS.

### Dashboard con datos reales de la API
- Total de productos.
- Productos con bajo stock o agotados (umbral: 5 unidades).
- Valor estimado de existencias: precio de cada producto multiplicado por su stock.
- Número de movimientos del Kardex.
- Distribución de productos por categoría (cinco principales).
- Estado de stock: normal, bajo, agotado.
- Actividad de los últimos 7 días (según los movimientos recuperados).
- Últimos cinco movimientos registrados.

### Páginas
- Dashboard: tarjetas y gráficos dinámicos.
- Productos: formulario relacional, listado, búsqueda, filtros de stock y etiquetas visuales.
- Categorías: altas, edición, eliminación, listado.
- Proveedores: altas, edición, eliminación, listado.
- Kardex: Entradas, Salidas, Ajustes e historial filtrable.

## Cómo usarlo en la PC de SENATI

En ambos proyectos utiliza la rama **feature/inventario-relacional**. El backend miApi debe estar funcionando con MySQL en el puerto 3006 y tener ejecutada la migración del esquema.

En el directorio del frontend:

```powershell
git pull origin feature/inventario-relacional
npm.cmd install
npm.cmd run dev
```

Abre http://localhost:5173. React consulta los endpoints /dashboard/resumen, /productos, /categorias y /movimientos; la información no está simulada.

## Notas

- El backend devuelve como máximo 300 movimientos recientes; la serie de siete días corresponde a los movimientos disponibles en esa respuesta y no necesariamente a todo el histórico si supera 300.
- La pantalla Usuarios no incorpora login; el administrador se crea mediante el script de miApi y el responsable del Kardex es académico, sin autenticación.
- La aplicación no debe publicarse para uso real sin autenticación ni autorización.
- Si actualizas mientras el frontend ya está ejecutándose, reinicia Vite si es necesario.
