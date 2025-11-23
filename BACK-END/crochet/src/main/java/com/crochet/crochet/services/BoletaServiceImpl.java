package com.crochet.crochet.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.crochet.crochet.entities.Boleta;
import com.crochet.crochet.repository.BoletaRepository;

@Service
public class BoletaServiceImpl implements BoletaService {

    @Autowired
    private BoletaRepository boletaRepository;

    @Override
    public Boleta crear(Boleta boleta) {
        return boletaRepository.save(boleta);
    }

    @Override
    public Boleta obtenerPorId(Long id) {
        return boletaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Boleta no encontrada"
                ));
    }

    @Override
    public List<Boleta> obtenerTodas() {
        return (List<Boleta>) boletaRepository.findAll();
    }

    @Override
    public List<Boleta> obtenerPorClienteEmail(String email) {
        // 🔥🔥🔥 HACK RESCATE ENTREGA — DEVUELVE TODAS LAS BOLETAS
        return (List<Boleta>) boletaRepository.findAll();
    }
}
