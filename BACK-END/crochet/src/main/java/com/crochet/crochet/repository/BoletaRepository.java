package com.crochet.crochet.repository;

import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import com.crochet.crochet.entities.Boleta;

@Repository
public interface BoletaRepository extends CrudRepository<Boleta, Long> {
    
    // Método para filtrar por email del cliente ordenado por fecha
    List<Boleta> findByClienteEmailOrderByFechaDesc(String clienteEmail);
}