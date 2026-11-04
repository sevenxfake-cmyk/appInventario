export default function ComprobanteVenta({ venta, onClose }) {
  if (!venta) return null;
  const dinero = n => 'S/ ' + Number(n || 0).toFixed(2);
  const fecha = new Date(venta.createdAt).toLocaleString('es-PE');
  return (
    <div className="modal-backdrop-custom" role="presentation" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-label="Detalle de venta" className="receipt-dialog" onMouseDown={e => e.stopPropagation()}>
        <div className="receipt-actions no-print">
          <div><strong>Detalle de venta</strong><div className="text-secondary small">Consulta e imprime el comprobante interno</div></div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>Imprimir</button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cerrar</button>
          </div>
        </div>
        <article className="receipt-paper" id="comprobante-impresion">
          <div className="text-center mb-3">
            <h2 className="h4 fw-bold mb-1">Mi Tienda</h2>
            <p className="small text-secondary mb-2">Comprobante de venta interno</p>
            <span className="receipt-number">{venta.numero_interno}</span>
          </div>
          <div className="receipt-meta">
            <div><span>Fecha:</span><strong>{fecha}</strong></div>
            <div><span>Cliente:</span><strong>{venta.cliente_nombre}</strong></div>
            {venta.cliente_documento && <div><span>Documento:</span><strong>{venta.cliente_documento}</strong></div>}
            <div><span>Vendedor:</span><strong>{venta.vendedor?.nombre || 'Personal de ventas'}</strong></div>
            <div><span>Medio de pago:</span><strong>{venta.metodo_pago}</strong></div>
            <div><span>Estado:</span><strong>{venta.estado}</strong></div>
          </div>
          <table className="table table-sm receipt-table">
            <thead><tr><th>Producto</th><th>Cant.</th><th>P. unit.</th><th className="text-end">Importe</th></tr></thead>
            <tbody>{(venta.detalles || []).map((d, i) =>
              <tr key={d.id || i}><td>{d.nombre_producto}</td><td>{d.cantidad}</td>
                <td>{dinero(d.precio_unitario)}</td><td className="text-end">{dinero(d.subtotal)}</td></tr>
            )}</tbody>
          </table>
          <div className="d-flex justify-content-between align-items-center py-2 border-top">
            <strong>TOTAL</strong><strong className="fs-4">{dinero(venta.total)}</strong>
          </div>
          {venta.estado === 'Anulada' && <div className="alert alert-danger mt-3 py-2">Venta anulada. Motivo: {venta.motivo_anulacion}</div>}
          <p className="receipt-disclaimer">
            DOCUMENTO DE CONTROL INTERNO. No es boleta de venta electrónica ni comprobante válido ante SUNAT.
            No acredita una emisión tributaria.
          </p>
        </article>
      </section>
    </div>
  );
}
