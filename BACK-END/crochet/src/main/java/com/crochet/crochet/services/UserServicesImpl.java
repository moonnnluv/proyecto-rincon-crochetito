package com.crochet.crochet.services;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.crochet.crochet.entities.EstadoUsuario;
import com.crochet.crochet.entities.Rol;
import com.crochet.crochet.entities.User;
import com.crochet.crochet.repository.UserRepository;

@Service
public class UserServicesImpl implements UserServices {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public UserServicesImpl(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @Override
    public List<User> listar() {
        return (List<User>) repo.findAll();
    }

    @Override
    public User obtener(Long id) {
        return repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no existe"));
    }

    @Override
    public User crear(User u, String rawPassword) {
        if (rawPassword == null || rawPassword.trim().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password mínimo 8 caracteres");
        }
        if (u.getRol() == null)    u.setRol(Rol.CLIENTE);
        if (u.getEstado() == null) u.setEstado(EstadoUsuario.ACTIVO);

        // email único
        if (u.getEmail() != null && repo.existsByEmail(u.getEmail().trim().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email ya registrado");
        }

        u.setPasswordHash(encoder.encode(rawPassword)); // <-- usa passwordHash
        return repo.save(u);
    }

    @Override
    public User actualizar(Long id, User cambios) {
        User actual = obtener(id);
        if (cambios.getNombre() != null) actual.setNombre(cambios.getNombre());
        if (cambios.getEmail() != null)  actual.setEmail(cambios.getEmail());
        if (cambios.getRol() != null)    actual.setRol(cambios.getRol());
        if (cambios.getEstado() != null) actual.setEstado(cambios.getEstado());
        return repo.save(actual);
    }

    @Override
    public void cambiarPassword(Long id, String rawPassword) {
        if (rawPassword == null || rawPassword.trim().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password mínimo 8 caracteres");
        }
        User u = obtener(id);
        u.setPasswordHash(encoder.encode(rawPassword)); // <-- usa passwordHash
        repo.save(u);
    }

    @Override
    public User cambiarEstado(Long id, EstadoUsuario nuevoEstado) {
        if (nuevoEstado == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado requerido");
        User u = obtener(id);
        u.setEstado(nuevoEstado);
        return repo.save(u);
    }

    @Override
    public void eliminar(Long id) {
        User u = obtener(id);
        repo.delete(u);
    }

    @Override
    public User login(String email, String rawPassword) {
        User u = repo.findByEmail(email.trim().toLowerCase())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));

        if (u.getEstado() == EstadoUsuario.INACTIVO) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario inactivo");
        }
        // compara contra passwordHash
        if (!encoder.matches(rawPassword, u.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
        }
        return u;
    }
}
