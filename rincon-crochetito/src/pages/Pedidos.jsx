export default function Pedidos() {
  // por ahora solo UI (template de Etapa 1)
  const pedidos = []; // luego lo llenamos desde API/localStorage

  return (
    <section className="container py-4">
      <h3 className="mb-3">Mis pedidos</h3>

      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th className="text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{new Date(p.fecha).toLocaleDateString("es-CL")}</td>
                <td><span className="badge text-bg-secondary">{p.estado}</span></td>
                <td className="text-end">${p.total?.toLocaleString?.()}</td>
              </tr>
            ))}
            {!pedidos.length && (
              <tr>
                <td colSpan={4} className="text-center text-muted py-5">
                  Aún no tienes pedidos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
