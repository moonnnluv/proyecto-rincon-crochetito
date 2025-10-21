import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createProducto, getProducto, updateProducto, uploadProductoImagen } from "../../../services/api.js";


export default function ProductoForm() {
  const { id } = useParams();
  const editing = !!id && id !== "nuevo";
  const nav = useNavigate();
  const [form, setForm] = useState({ nombre:"", descripcion:"", precio:0, stock:0, imagenUrl:"", estado:"ACTIVO", destacado:false });
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  useEffect(() => { if (editing) getProducto(id).then(p => setForm(p)); }, [editing, id]);

  function validate() {
    const e = {};
    if (!form.nombre?.trim()) e.nombre = "Requerido";
    if ((+form.precio || 0) <= 0) e.precio = "Precio > 0";
    if ((+form.stock || 0) < 0) e.stock = "Stock ≥ 0";
    setErrors(e); return Object.keys(e).length === 0;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    try {
      let saved;
      if (editing) saved = await updateProducto(id, { ...form, precio:+form.precio, stock:+form.stock });
      else saved = await createProducto({ ...form, precio:+form.precio, stock:+form.stock });

      const file = fileRef.current?.files?.[0];
      if (file) await uploadProductoImagen(saved.id ?? id, file);

      nav("/admin/productos");
    } catch (err) { alert("Error: " + err); }
  }

  return (
    <section className="admin-wrap">
      <h2>{editing ? "Editar producto" : "Nuevo producto"}</h2>
      <form className="form" onSubmit={onSubmit}>
        <label>Nombre
          <input value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})}/>
          {errors.nombre && <small className="err">{errors.nombre}</small>}
        </label>
        <label>Descripción
          <textarea rows={4} value={form.descripcion} onChange={e=>setForm({...form, descripcion:e.target.value})}/>
        </label>
        <div className="grid-2">
          <label>Precio ($)
            <input type="number" min={0} value={form.precio} onChange={e=>setForm({...form, precio:e.target.value})}/>
            {errors.precio && <small className="err">{errors.precio}</small>}
          </label>
          <label>Stock
            <input type="number" min={0} value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})}/>
            {errors.stock && <small className="err">{errors.stock}</small>}
          </label>
        </div>
        <label>Imagen (opcional)
          <input type="file" accept="image/*" ref={fileRef}/>
        </label>
        <label className="check">
          <input type="checkbox" checked={!!form.destacado} onChange={e=>setForm({...form, destacado:e.target.checked})}/>
          <span>Destacado</span>
        </label>
        <div className="form-actions">
          <button className="btn primary" type="submit">{editing ? "Guardar":"Crear"}</button>
          <button className="btn" type="button" onClick={()=>history.back()}>Cancelar</button>
        </div>
      </form>
    </section>
  );
}
