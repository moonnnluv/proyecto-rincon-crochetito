package com.crochet.crochet.repository;

import java.util.List;
import org.springframework.data.repository.CrudRepository;
import com.crochet.crochet.entities.Boleta;

public interface BoletaRepository extends CrudRepository<Boleta, Long> {

    // Buscar todas las boletas de un correo, ordenadas de la más nueva a la más antigua
    List<Boleta> findByClienteEmailOrderByFechaDesc(String clienteEmail);
}
