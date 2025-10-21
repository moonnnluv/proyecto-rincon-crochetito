package com.crochet.crochet.services;

import java.util.List;

import org.springframework.http.HttpStatus;                         
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;     

import com.crochet.crochet.entities.EstadoUsuario;
import com.crochet.crochet.entities.User;
import com.crochet.crochet.repository.UserRepository;

@Service
@Transactional
public class UserServiceImpl implements UserServices {

  private final UserRepository repo;
  private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

  public UserServiceImpl(UserRepository repo) { this.repo = repo; }

  @Override @Transactional(readOnly = true)
  public List<User> listar() { return repo.findAll(); }

  @Override @Transactional(readOnly = true)
  public User obtener(Long id) {
    return repo.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
  }

  @Override
  public User crear(User u, String rawPassword) {
    String email = u.getEmail().trim().toLowerCase();
    if (repo.existsByEmail(email)) throw new RuntimeException("Email ya registrado");
    u.setEmail(email);
    u.setPasswordHash(encoder.encode(rawPassword));
    return repo.save(u);
  }

  @Override
  public User actualizar(Long id, User cambios) {
    User u = obtener(id);
    if (cambios.getNombre()!=null) u.setNombre(cambios.getNombre());
    if (cambios.getEmail()!=null)  u.setEmail(cambios.getEmail().trim().toLowerCase());
    if (cambios.getRol()!=null)    u.setRol(cambios.getRol());
    if (cambios.getEstado()!=null) u.setEstado(cambios.getEstado());
    return repo.save(u);
  }

  @Override
  public void cambiarPassword(Long id, String rawPassword) {
    User u = obtener(id);
    u.setPasswordHash(encoder.encode(rawPassword));
    repo.save(u);
  }

  @Override
  public User cambiarEstado(Long id, EstadoUsuario estado) {
    User u = obtener(id);
    u.setEstado(estado);
    return repo.save(u);
  }

  @Override
  public void eliminar(Long id) { repo.deleteById(id); }

  // login real contra BD (bcrypt + estado)
  @Override @Transactional(readOnly = true)
  public User login(String email, String rawPassword) {
    String mail = email.trim().toLowerCase();
    User u = repo.findByEmailIgnoreCase(mail)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));

    // OJO: usamos passwordHash (tu entidad debe exponer getPasswordHash())
    if (!encoder.matches(rawPassword, u.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
    }
    if (u.getEstado() != null && u.getEstado() != EstadoUsuario.ACTIVO) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario inactivo");
    }
    return u;
  }
}
