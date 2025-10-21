package com.crochet.crochet.services;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.crochet.crochet.entities.User;
import com.crochet.crochet.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServicesTest {

    @Mock UserRepository repo;

    @InjectMocks UserServiceImpl service;

    @Test
    void crear_encriptaPassword_y_guarda() {
        User input = new User();
        input.setNombre("Dani");
        input.setEmail("dani@x.cl");

        when(repo.save(any(User.class))).thenAnswer(inv -> {
        User u = inv.getArgument(0);
        u.setId(99L);
        return u;
        });

        User creado = service.crear(input, "secreto123");

        assertNotNull(creado.getId());
        assertEquals(99L, creado.getId());

        // El hash es BCrypt real: debe matchear la contraseña cruda
        assertTrue(new BCryptPasswordEncoder().matches("secreto123", creado.getPasswordHash()));

        verify(repo).save(any(User.class));
    }

    @Test
    void cambiarPassword_usaBCrypt_y_persiste() {
        User db = new User();
        db.setId(1L);
        db.setEmail("admin@crochetito.cl");
        db.setPasswordHash("$old");

        when(repo.findById(1L)).thenReturn(Optional.of(db));
        when(repo.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        service.cambiarPassword(1L, "nueva123");

        // Debe quedar un hash BCrypt que matchee "nueva123"
        assertTrue(new BCryptPasswordEncoder().matches("nueva123", db.getPasswordHash()));
        verify(repo).save(db);
    }
}
