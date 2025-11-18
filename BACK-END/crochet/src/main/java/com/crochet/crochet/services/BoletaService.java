package com.crochet.crochet.services;

import java.util.List;

import com.crochet.crochet.entities.Boleta;

public interface BoletaService {

    Boleta crear(Boleta boleta);

    Boleta obtenerPorId(Long id);

    List<Boleta> obtenerTodas();
}
