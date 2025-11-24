package com.crochet.crochet.services;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.crochet.crochet.entities.Boleta;
import com.crochet.crochet.repository.BoletaRepository;

@ExtendWith(MockitoExtension.class)
class BoletaServiceImplTest {

    @Mock
    private BoletaRepository boletaRepository;

    @InjectMocks
    private BoletaServiceImpl boletaService;

    @Test
    @DisplayName("obtenerPorClienteEmail debe lanzar BAD_REQUEST si el email es nulo")
    void obtenerPorClienteEmail_debeFallarSiEmailEsNulo() {
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> boletaService.obtenerPorClienteEmail(null)
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Email requerido"));
        verifyNoInteractions(boletaRepository);
    }

    @Test
    @DisplayName("obtenerPorClienteEmail debe lanzar BAD_REQUEST si el email está vacío")
    void obtenerPorClienteEmail_debeFallarSiEmailEsVacio() {
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> boletaService.obtenerPorClienteEmail("   ")
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Email requerido"));
        verifyNoInteractions(boletaRepository);
    }

    @Test
    @DisplayName("obtenerPorClienteEmail debe normalizar el email (trim+lowercase) y consultar el repositorio")
    void obtenerPorClienteEmail_okDebeConsultarRepositorioConEmailNormalizado() {
        // given
        String emailEntrada = "   CLIENTE@MAIL.COM   ";
        String emailNormalizado = "cliente@mail.com";

        Boleta b1 = new Boleta();
        Boleta b2 = new Boleta();
        List<Boleta> boletasMock = Arrays.asList(b1, b2);

        when(boletaRepository.findByClienteEmailOrderByFechaDesc(emailNormalizado))
                .thenReturn(boletasMock);

        // when
        List<Boleta> resultado = boletaService.obtenerPorClienteEmail(emailEntrada);

        // then
        assertNotNull(resultado);
        assertEquals(boletasMock.size(), resultado.size());
        assertEquals(boletasMock, resultado);

        verify(boletaRepository, times(1))
                .findByClienteEmailOrderByFechaDesc(emailNormalizado);

        verifyNoMoreInteractions(boletaRepository);
    }
}
