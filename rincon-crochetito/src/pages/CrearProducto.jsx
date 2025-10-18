import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';



export default function CrearProducto() {
  
    const [categorias, setCategorias] =useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingCategorias, setLoadingCategorias] = useState(true);

    const navigate = useNavigate();

    const [producto, setProducto] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        categoria: ''
    });


    useEffect(() =>{ 
        fetch('http://localhost:8080/api/categorias')
        .then(response =>{ 
            if (!response.ok){
                throw new Error("Error al cargar categorias");
            }
            return response.json();
        })
        .then(data =>{ 
            setCategorias(data);

        })
        .catch(error=>{ 
            console.log("Error de acceso a Categorias ", error);
        })
        
    },[]); //useEffect

    //captura los cambios de los elementos del formulario 
    const handleChange = (e) => {
        const {name, value} = e.target;
        setProducto(prev => ({ 
            ...prev, 
            [name] : value
          }))
    }

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

  const productoParaEnviar = {
    nombre: producto.nombre.trim(),
    descripcion: producto.descripcion.trim(),
    precio: parseFloat(producto.precio),
    categoria: { id: parseInt(producto.categoria, 10) }
  };

    try {
      const response = await fetch(`${API_BASE_URL}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productoParaEnviar)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear el producto');
      }

      navigate('/inventario', {
        state: { message: 'Producto creado exitosamente' }
      });

    } catch (err) {
      setError(err.message || 'No se pudo crear el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const tieneContenido = Object.values(producto).some(val => val !== '');

    if (!tieneContenido || window.confirm('¿Está seguro de cancelar? Se perderán los datos ingresados.')) {
      navigate('/inventario');
    }
  };

  return (
    <>
      <Navbar />

      <div className="crear-producto-container">
        <div className="form-card">
          <h2>Crear Producto</h2>
            {error && (
              <div className="error-message">
                {error}
                <button onClick={() => setError(null)} className="error-close">×</button>
              </div>
            )}
          {loadingCategorias ? (
            <div className="loading">Cargando categorías...</div>
          ) : (

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre">
                    Nombre del producto <span className="required">*</span>
                  </label>
                  <input
                    type="text" id="nombre" name="nombre" value={producto.nombre}
                    onChange={handleChange} disabled={loading} maxLength={100}
                    placeholder="Ej: Sopaipillas con pebre" required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="precio">
                    Precio <span className="required">*</span>
                  </label>
                  <div className="price-input">
                    <span className="currency">$</span>
                    <input
                      type="number" id="precio" name="precio" step="1" min="1"
                      value={producto.precio} onChange={handleChange} disabled={loading}
                      placeholder="1000" required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">
                  Descripción <span className="required">*</span>
                </label>
                <textarea
                  id="descripcion" name="descripcion" rows="4"
                  value={producto.descripcion} onChange={handleChange} disabled={loading}
                  maxLength={500} placeholder="Características principales del producto..."
                  required
                />
                  <small className="char-count">
                    {producto.descripcion.length}/500 caracteres
                  </small>
              </div>

              <div className="form-group">
                <label htmlFor="categoria">
                  Categoría <span className="required">*</span>
                </label>
                <select
                  id="categoria" name="categoria" value={producto.categoria}
                  onChange={handleChange} disabled={loading || categorias.length === 0}
                  required>
                    
                  <option value="">Seleccione una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}

                </select>
                {categorias.length === 0 && !loadingCategorias && (
                  <small className="error-text">No hay categorías disponibles</small>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Guardando...' : 'Crear Producto'}
                </button>
                <button type="button" onClick={handleCancel} disabled={loading} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}