package com.crochet.crochet.services;

import java.util.List;

import com.crochet.crochet.entities.Producto;

public interface ProductoServices {
    Producto crear(Producto producto);
    Producto obtenerId(Long id);
    List<Producto> obtenerTodos();
    void eliminar(Long id);
    Producto actualizar(Long id, Producto productoActualizado);

}
