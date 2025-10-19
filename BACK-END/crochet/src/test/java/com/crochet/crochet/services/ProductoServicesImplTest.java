package com.crochet.crochet.services;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.crochet.crochet.entities.Categoria;
import com.crochet.crochet.entities.Producto;
import com.crochet.crochet.repository.ProductoRepositories;

@ExtendWith(MockitoExtension.class)
class ProductoServicesImplTest {

    @Mock ProductoRepositories repo;
    @InjectMocks ProductoServicesImpl service;

    @Test
    void crear_guardaYDevuelveConId() {
        var cat = new Categoria(); cat.setId(2L);
        var in  = new Producto();
        in.setNombre("Honguito");
        in.setPrecio(4500L);
        in.setDescripcion("Funda");
        in.setCategoria(cat);
        in.setActivo(true);

        when(repo.save(any(Producto.class))).thenAnswer(inv -> {
            var p = (Producto) inv.getArgument(0);
            p.setId(5L);
            return p;
        });

        var out = service.crear(in);

        assertThat(out.getId()).isEqualTo(5L);
        assertThat(out.getActivo()).isTrue();
        verify(repo).save(any(Producto.class));
    }

    @Test
    void obtenerId_existente_ok() {
        var p = new Producto();
        p.setId(1L); p.setNombre("Cintillo"); p.setPrecio(6000L);
        when(repo.findById(1L)).thenReturn(Optional.of(p));

        var out = service.obtenerId(1L);

        assertThat(out.getNombre()).isEqualTo("Cintillo");
        verify(repo).findById(1L);
    }

    @Test
    void actualizar_cambiaCamposYCategoria_yGuarda() {
        var db = new Producto();
        db.setId(10L); db.setNombre("Viejo"); db.setDescripcion("Desc"); db.setPrecio(1000L); db.setActivo(true);
        when(repo.findById(10L)).thenReturn(Optional.of(db));
        when(repo.save(any(Producto.class))).thenAnswer(inv -> inv.getArgument(0));

        var cat = new Categoria(); cat.setId(3L);
        var cambios = new Producto();
        cambios.setNombre("Nuevo");
        cambios.setDescripcion("Mejor");
        cambios.setPrecio(9999L);
        cambios.setCategoria(cat);

        var out = service.actualizar(10L, cambios);

        assertThat(out.getNombre()).isEqualTo("Nuevo");
        assertThat(out.getDescripcion()).isEqualTo("Mejor");
        assertThat(out.getPrecio()).isEqualTo(9999L);
        assertThat(out.getCategoria()).isNotNull();
        assertThat(out.getCategoria().getId()).isEqualTo(3L);
        verify(repo).save(any(Producto.class));
    }

    @Test
    void desactivar_seteaActivoFalse() {
        var p = new Producto();
        p.setId(7L); p.setNombre("Gorro"); p.setActivo(true);
        when(repo.findById(7L)).thenReturn(Optional.of(p));
        when(repo.save(any(Producto.class))).thenAnswer(inv -> inv.getArgument(0));

        var out = service.desactivar(7L);

        assertThat(out.getActivo()).isFalse();
        verify(repo).save(any(Producto.class));
    }
}
