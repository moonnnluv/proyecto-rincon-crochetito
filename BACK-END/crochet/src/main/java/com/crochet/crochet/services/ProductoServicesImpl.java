package com.crochet.crochet.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.crochet.crochet.entities.Producto;
import com.crochet.crochet.repository.ProductoRepositories;

@Service
public class ProductoServicesImpl implements ProductoServices {

    @Autowired
    private ProductoRepositories productoRepositories;

    @Override
    public Producto crear(Producto producto) {
        return productoRepositories.save(producto);
    }

    @Override
    public Producto obtenerId(Long id) {
        return productoRepositories.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    @Override
    public List<Producto> obtenerTodos() {
        return (List<Producto>) productoRepositories.findAll();
    }

    @Override
    public void eliminar(Long id) {
        if (!productoRepositories.existsById(id)) {
            throw new RuntimeException("Producto no encontrado");
        }
        productoRepositories.deleteById(id);
    }

    @Override
    public Producto actualizar(Long id, Producto productoActualizado) {
        Producto existente = obtenerId(id);

        if (productoActualizado.getNombre() != null)
            existente.setNombre(productoActualizado.getNombre());

        if (productoActualizado.getPrecio() != null)
            existente.setPrecio(productoActualizado.getPrecio());

        if (productoActualizado.getDescripcion() != null)
            existente.setDescripcion(productoActualizado.getDescripcion());

        if (productoActualizado.getCategoria() != null)
            existente.setCategoria(productoActualizado.getCategoria());

        if (productoActualizado.getActivo() != null)
            existente.setActivo(productoActualizado.getActivo());

        // NUEVO: soportar actualización de stock e imagen en PUT
        try {
            if (productoActualizado.getStock() != null)
                existente.setStock(Math.max(0, productoActualizado.getStock()));
        } catch (NoSuchMethodError | NullPointerException ignored) { /* por si el entity cambia */ }

        try {
            if (productoActualizado.getImagen() != null)
                existente.setImagen(productoActualizado.getImagen());
        } catch (NoSuchMethodError | NullPointerException ignored) { /* por si el entity cambia */ }

        return productoRepositories.save(existente);
    }

    @Override
    public Producto desactivar(Long id) {
        Producto producto = obtenerId(id);
        producto.setActivo(false);
        return productoRepositories.save(producto);
    }
}
