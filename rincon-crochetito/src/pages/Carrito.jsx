export default function Carrito(){
  return (
    <section className="container py-4">
      <h2 className="mb-3">Carrito</h2>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Producto</th>
              <th style={{width:120}}>Precio</th>
              <th style={{width:120}}>Cantidad</th>
              <th style={{width:120}}>Subtotal</th>
              <th style={{width:60}}></th>
            </tr>
          </thead>
          <tbody>
            {/* De momento vacío para 2.1 (solo diseño). */}
            <tr>
              <td colSpan={5} className="text-center text-muted py-5">
                Tu carrito está vacío.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-end">
        <button className="btn btn-dark" disabled>Ir a pagar</button>
      </div>
    </section>
  );
}
