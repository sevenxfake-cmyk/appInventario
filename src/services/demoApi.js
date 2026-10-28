// Almacenamiento local para la vista pública de demostración.
// NO sustituye una base MySQL ni comparte registros entre navegadores.
const KEY = 'senati-inventario-demo-v1';
let memoria = null;

const fechaDiasAtras = (n) => new Date(Date.now() - n * 86400000).toISOString();
const semillas = () => ({
  categorias: [
    { id: 1, nombre: 'Accesorios', descripcion: 'Accesorios para inventario' },
    { id: 2, nombre: 'Limpieza', descripcion: 'Productos de limpieza' },
    { id: 3, nombre: 'Herramientas', descripcion: 'Artículos y herramientas' }
  ],
  proveedores: [
    { id: 1, razon_social: 'Proveedor de ejemplo A', contacto: 'Ventas', telefono: '', email: '' },
    { id: 2, razon_social: 'Proveedor de ejemplo B', contacto: 'Distribución', telefono: '', email: '' }
  ],
  usuarios: [{ id: 1, nombre: 'Responsable Demo', rol: 'Administrador' }],
  productos: [
    { id: 1, nombre: 'Teclado USB', descripcion: 'Teclado de ejemplo', precio: '46.00', stock: 18, categoria_id: 1, proveedor_id: 1 },
    { id: 2, nombre: 'Mouse óptico', descripcion: 'Mouse de ejemplo', precio: '25.00', stock: 4, categoria_id: 1, proveedor_id: 1 },
    { id: 3, nombre: 'Brocha mediana', descripcion: 'Producto de ejemplo', precio: '12.50', stock: 0, categoria_id: 3, proveedor_id: 2 },
    { id: 4, nombre: 'Paño microfibra', descripcion: 'Producto de ejemplo', precio: '4.50', stock: 12, categoria_id: 2, proveedor_id: 2 },
    { id: 5, nombre: 'Guantes de limpieza', descripcion: 'Producto de ejemplo', precio: '9.90', stock: 6, categoria_id: 2, proveedor_id: 2 },
    { id: 6, nombre: 'Escobilla', descripcion: 'Producto de ejemplo', precio: '7.00', stock: 1, categoria_id: 2, proveedor_id: null }
  ],
  movimientos: [
    { id: 1, producto_id: 1, usuario_id: 1, tipo_movimiento: 'Entrada', cantidad: 20, stock_anterior: 0, stock_nuevo: 20, fecha_hora: fechaDiasAtras(5), observaciones: 'Stock inicial demo' },
    { id: 2, producto_id: 2, usuario_id: 1, tipo_movimiento: 'Entrada', cantidad: 10, stock_anterior: 0, stock_nuevo: 10, fecha_hora: fechaDiasAtras(4), observaciones: 'Stock inicial demo' },
    { id: 3, producto_id: 5, usuario_id: 1, tipo_movimiento: 'Entrada', cantidad: 8, stock_anterior: 0, stock_nuevo: 8, fecha_hora: fechaDiasAtras(4), observaciones: 'Stock inicial demo' },
    { id: 4, producto_id: 6, usuario_id: 1, tipo_movimiento: 'Entrada', cantidad: 1, stock_anterior: 0, stock_nuevo: 1, fecha_hora: fechaDiasAtras(3), observaciones: 'Stock inicial demo' },
    { id: 5, producto_id: 4, usuario_id: 1, tipo_movimiento: 'Entrada', cantidad: 12, stock_anterior: 0, stock_nuevo: 12, fecha_hora: fechaDiasAtras(2), observaciones: 'Stock inicial demo' },
    { id: 6, producto_id: 1, usuario_id: 1, tipo_movimiento: 'Salida', cantidad: 2, stock_anterior: 20, stock_nuevo: 18, fecha_hora: fechaDiasAtras(1), observaciones: 'Venta de ejemplo' },
    { id: 7, producto_id: 2, usuario_id: 1, tipo_movimiento: 'Salida', cantidad: 6, stock_anterior: 10, stock_nuevo: 4, fecha_hora: fechaDiasAtras(1), observaciones: 'Venta de ejemplo' },
    { id: 8, producto_id: 5, usuario_id: 1, tipo_movimiento: 'Salida', cantidad: 2, stock_anterior: 8, stock_nuevo: 6, fecha_hora: fechaDiasAtras(0), observaciones: 'Venta de ejemplo' }
  ]
});

function cargar() {
  if (memoria) return memoria;
  try {
    const guardado = window.localStorage.getItem(KEY);
    if (guardado) {
      const obj = JSON.parse(guardado);
      if (obj && Array.isArray(obj.productos) && Array.isArray(obj.movimientos)) {
        memoria = obj;
        return obj;
      }
    }
  } catch { /* El modo privado puede bloquear el almacenamiento */ }
  memoria = semillas();
  guardar(memoria);
  return memoria;
}
function guardar(db) {
  memoria = db;
  try { window.localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* Sin persistencia en modo privado */ }
}
function clonar(x) { return JSON.parse(JSON.stringify(x)); }
function error(mensaje, status = 400) {
  const e = new Error(mensaje);
  e.response = { status, data: { error: mensaje } };
  throw e;
}
function idNuevo(items) { return Math.max(0, ...items.map(x => Number(x.id))) + 1; }
function categoria(db, id) { return db.categorias.find(c => c.id === Number(id)); }
function proveedor(db, id) { return db.proveedores.find(p => p.id === Number(id)); }
function obtenerListaProductos(db) {
  return db.productos.map(p => ({
    ...p,
    categoria: categoria(db, p.categoria_id) || null,
    proveedor: proveedor(db, p.proveedor_id) || null
  })).sort((a, b) => b.id - a.id);
}
function obtenerMovimientos(db) {
  return db.movimientos.map(m => ({
    ...m, producto: db.productos.find(p => p.id === m.producto_id) || null,
    usuario: db.usuarios.find(u => u.id === m.usuario_id) || null
  })).sort((a, b) => b.id - a.id);
}
function validarProducto(db, p) {
  if (!p.nombre || !p.nombre.trim()) error('Nombre obligatorio');
  if (!p.categoria_id || !categoria(db, p.categoria_id)) error('Selecciona una categoría existente');
  if (p.precio === '' || !Number.isFinite(Number(p.precio)) || Number(p.precio) < 0) error('Precio inválido');
  if (p.proveedor_id && !proveedor(db, p.proveedor_id)) error('El proveedor no existe');
}
function peticion(method, url, datos = {}) {
  const db = cargar();
  const [ruta, id] = String(url).split('/').filter(Boolean);
  const idx = id ? Number(id) : null;
  let resultado;
  if (method === 'get') {
    if (ruta === 'productos') resultado = obtenerListaProductos(db);
    else if (ruta === 'categorias') resultado = [...db.categorias].sort((a,b) => a.nombre.localeCompare(b.nombre));
    else if (ruta === 'proveedores') resultado = [...db.proveedores].sort((a,b) => a.razon_social.localeCompare(b.razon_social));
    else if (ruta === 'usuarios') resultado = db.usuarios.map(u => ({ id:u.id, nombre:u.nombre, rol:u.rol }));
    else if (ruta === 'movimientos') resultado = obtenerMovimientos(db);
    else if (ruta === 'dashboard' && id === 'resumen') resultado = {
      totalProductos: db.productos.length,
      bajoStock: db.productos.filter(p => Number(p.stock) <= 5).length,
      totalCategorias: db.categorias.length,
      totalProveedores: db.proveedores.length,
      totalMovimientos: db.movimientos.length
    };
    else error('Ruta no encontrada',404);
    return Promise.resolve({ data: clonar(resultado) });
  }

  if (ruta === 'categorias' || ruta === 'proveedores') {
    const lista = db[ruta];
    const campo = ruta === 'categorias' ? 'nombre' : 'razon_social';
    const actual = idx ? lista.find(item => item.id === idx) : null;
    if (method === 'post' || method === 'put') {
      if (!datos[campo]?.trim()) error('Completa el campo obligatorio');
      if (method === 'put' && !actual) error('Registro no encontrado',404);
      if (ruta === 'categorias' && lista.some(x => x.nombre.toLowerCase() === datos.nombre.trim().toLowerCase() && x.id !== idx)) error('Ya existe esa categoría',409);
      resultado = method === 'post' ? { id:idNuevo(lista), ...datos } : { ...actual, ...datos, id:idx };
      if (method === 'post') lista.push(resultado);
      else Object.assign(actual, resultado);
    } else if (method === 'delete') {
      if (!actual) error('Registro no encontrado',404);
      const campoFk = ruta === 'categorias' ? 'categoria_id' : 'proveedor_id';
      if (db.productos.some(p => p[campoFk] === idx)) error('Hay productos asociados a este registro',409);
      lista.splice(lista.indexOf(actual), 1);
      resultado = { message:'Registro eliminado' };
    } else error('Método no permitido',405);
  } else if (ruta === 'productos') {
    const actual = idx ? db.productos.find(p => p.id === idx) : null;
    if (method === 'post' || method === 'put') {
      if (method === 'put' && !actual) error('Producto no encontrado',404);
      if (method === 'put' && datos.stock !== undefined) error('Modifica el stock desde Kardex');
      validarProducto(db, datos);
      const normalizado = {
        nombre:datos.nombre.trim(),
        descripcion:datos.descripcion || '',
        precio:Number(datos.precio).toFixed(2),
        categoria_id:Number(datos.categoria_id),
        proveedor_id:datos.proveedor_id ? Number(datos.proveedor_id) : null
      };
      if (method === 'post') {
        resultado = { id:idNuevo(db.productos),...normalizado,stock:0 };
        db.productos.push(resultado);
      } else { Object.assign(actual,normalizado); resultado = actual; }
    } else if (method === 'delete') {
      if (!actual) error('Producto no encontrado',404);
      if (db.movimientos.some(m => m.producto_id === idx)) error('No se puede eliminar un producto con historial Kardex',409);
      db.productos.splice(db.productos.indexOf(actual),1);
      resultado = { message:'Producto eliminado' };
    } else error('Método no permitido',405);
  } else if (ruta === 'movimientos' && method === 'post') {
    const p = db.productos.find(x => x.id === Number(datos.producto_id));
    const u = db.usuarios.find(x => x.id === Number(datos.usuario_id));
    if (!p || !u) error('Selecciona un producto y responsable válido');
    if (!['Entrada','Salida','Ajuste'].includes(datos.tipo_movimiento)) error('Tipo de movimiento inválido');
    const cantidad = Number(datos.cantidad);
    if (!Number.isInteger(cantidad) || cantidad < 0 || (datos.tipo_movimiento !== 'Ajuste' && !cantidad)) error('Cantidad inválida');
    const previo = Number(p.stock);
    const nuevo = datos.tipo_movimiento === 'Entrada' ? previo + cantidad : datos.tipo_movimiento === 'Salida' ? previo - cantidad : cantidad;
    if (nuevo < 0) error('Stock insuficiente para registrar una salida',409);
    resultado = {
      id:idNuevo(db.movimientos), producto_id:p.id, usuario_id:u.id,
      tipo_movimiento:datos.tipo_movimiento, cantidad,
      fecha_hora:new Date().toISOString(), observaciones:datos.observaciones || '',
      stock_anterior:previo,stock_nuevo:nuevo
    };
    db.movimientos.push(resultado);
    p.stock = nuevo;
  } else error('Ruta no encontrada',404);

  guardar(db);
  return Promise.resolve({ data:clonar(resultado) });
}

export default {
  get: (url) => peticion('get',url),
  post: (url,data) => peticion('post',url,data),
  put: (url,data) => peticion('put',url,data),
  delete: (url) => peticion('delete',url)
};
