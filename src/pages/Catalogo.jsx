import { useCallback, useEffect, useState } from 'react';
import api from '../services/api.js';
import Icon from '../components/ui/Icon.jsx';

const config = {
  categorias: {
    titulo: 'Categorías',
    campos: [
      ['nombre', 'Nombre', true],
      ['descripcion', 'Descripción', false]
    ]
  },
  proveedores: {
    titulo: 'Proveedores',
    campos: [
      ['razon_social', 'Razón social', true],
      ['contacto', 'Contacto', false],
      ['telefono', 'Teléfono', false],
      ['email', 'Correo electrónico', false]
    ]
  }
};
function vacio(campos) {
  return Object.fromEntries([['id', null], ...campos.map(([name]) => [name, ''])]);
}
export default function Catalogo({ tipo }) {
  const { titulo, campos } = config[tipo];
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(() => vacio(campos));
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const r = await api.get('/' + tipo);
      setLista(r.data);
    } catch (err) { setError(err.response?.data?.error || 'No se pudo cargar el catálogo'); }
  }, [tipo]);

  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setGuardando(true);
    try {
      if (form.id) await api.put('/' + tipo + '/' + form.id, form);
      else await api.post('/' + tipo, form);
      setForm(vacio(campos));
      setMensaje('Registro guardado correctamente.');
      await cargar();
    } catch (err) { setError(err.response?.data?.error || 'No se pudo guardar'); }
    finally { setGuardando(false); }
  };
  const eliminar = async (id) => {
    if (!window.confirm('¿Deseas eliminar este registro?')) return;
    setError(''); setMensaje('');
    try {
      await api.delete('/' + tipo + '/' + id);
      await cargar();
      setMensaje('Registro eliminado.');
    } catch (err) { setError(err.response?.data?.error || 'No se puede eliminar un registro en uso.'); }
  };
  return (
    <>
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <div className="page-kicker">ADMINISTRACIÓN DE CATÁLOGOS</div>
          <h1 className="page-title">Gestión de {titulo.toLowerCase()}</h1>
          <p className="page-description">{tipo === 'categorias' ? 'Clasifica tu inventario y organiza los productos por categoría.' : 'Administra los datos de las empresas y contactos que abastecen tus productos.'}</p>
        </div>
        <div className="d-flex align-items-center gap-2"><span className="metric-icon icon-violet"><Icon name={tipo === 'categorias' ? 'category' : 'supplier'}/></span><span><strong className="d-block fs-4 lh-1">{lista.length}</strong><span className="small text-secondary">registros</span></span></div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      <div className="row g-4">
        <div className="col-lg-4">
          <form onSubmit={guardar} className="card form-card">
            <div className="card-body"><h2 className="section-title mb-1">{form.id ? 'Editar registro' : 'Nuevo registro'}</h2><p className="section-subtitle mb-4">Completa los datos y guarda los cambios.</p>
            {campos.map(([nombre, etiqueta, obligatorio]) => (
              <label key={nombre} className="form-label mb-3">
                {etiqueta}
                <input className="form-control mt-1" name={nombre}
                  type={nombre === 'email' ? 'email' : 'text'}
                  required={obligatorio} value={form[nombre] || ''}
                  onChange={e => setForm({ ...form, [nombre]: e.target.value })} />
              </label>
            ))}
            <button className="btn btn-primary w-100 d-flex justify-content-center align-items-center gap-2" disabled={guardando}><Icon name={form.id ? 'check' : 'plus'} size={16}/>{form.id ? 'Actualizar' : 'Guardar'}</button>
            {form.id && <button type="button" className="btn btn-outline-secondary w-100 mt-2" onClick={() => setForm(vacio(campos))}>Cancelar</button>}
          </div></form>
        </div>
        <div className="col-lg-8">
          <div className="card card-table h-100">
            <div className="card-head"><h2 className="section-title">Listado de {titulo.toLowerCase()}</h2><p className="section-subtitle mb-0">{lista.length} registros disponibles</p></div>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead ><tr><th>ID</th>{campos.map(([, etiqueta]) => <th key={etiqueta}>{etiqueta}</th>)}<th>Acciones</th></tr></thead>
              <tbody>{lista.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  {campos.map(([c]) => <td key={c}>{item[c]}</td>)}
                  <td className="text-nowrap">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setForm(item)}>Editar</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => eliminar(item.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
                {!lista.length && <tr><td colSpan={campos.length + 2} className="text-center">Sin registros</td></tr>}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}
