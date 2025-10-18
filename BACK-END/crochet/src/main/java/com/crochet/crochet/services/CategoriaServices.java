package com.crochet.crochet.services;

import java.util.List;

import com.crochet.crochet.entities.Categoria;

public interface CategoriaServices {

    Categoria crear(Categoria categoria);
    Categoria obtenerId(Long id);
    List<Categoria> obtenerTodas();
    void eliminar(Long id);
    Categoria actualizar(Long id, Categoria categoriaActualizada);

}
