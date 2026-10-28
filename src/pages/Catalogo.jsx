import { useCallback, useEffect, useState } from 'react';
import api from '../services/api.js';

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
      <h2>{titulo}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      <div className="row g-4">
        <div className="col-lg-4">
          <form onSubmit={guardar} className="card card-body shadow-sm">
            <h5>{form.id ? 'Editar' : 'Nuevo registro'}</h5>
            {campos.map(([nombre, etiqueta, obligatorio]) => (
              <label key={nombre} className="form-label mb-3">
                {etiqueta}
                <input className="form-control" name={nombre}
                  type={nombre === 'email' ? 'email' : 'text'}
                  required={obligatorio} value={form[nombre] || ''}
                  onChange={e => setForm({ ...form, [nombre]: e.target.value })} />
              </label>
            ))}
            <button className="btn btn-primary" disabled={guardando}>{form.id ? 'Actualizar' : 'Guardar'}</button>
            {form.id && <button type="button" className="btn btn-outline-secondary mt-2" onClick={() => setForm(vacio(campos))}>Cancelar</button>}
          </form>
        </div>
        <div className="col-lg-8">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark"><tr><th>ID</th>{campos.map(([, etiqueta]) => <th key={etiqueta}>{etiqueta}</th>)}<th>Acciones</th></tr></thead>
              <tbody>{lista.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  {campos.map(([c]) => <td key={c}>{item[c]}</td>)}
                  <td className="text-nowrap">
                    <button className="btn btn-sm btn-warning me-2" onClick={() => setForm(item)}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => eliminar(item.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
                {!lista.length && <tr><td colSpan={campos.length + 2} className="text-center">Sin registros</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
