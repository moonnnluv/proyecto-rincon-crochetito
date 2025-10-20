package com.crochet.crochet.restcontrollers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.crochet.crochet.entities.EstadoUsuario;
import com.crochet.crochet.entities.User;
import com.crochet.crochet.repository.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Tag(name = "Autenticación", description = "Operaciones relacionadas con la autenticación de usuarios")
@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin
public class AuthRestController {

  private final UserRepository repo;
  private final PasswordEncoder encoder;

  public AuthRestController(UserRepository repo, PasswordEncoder encoder) {
    this.repo = repo;
    this.encoder = encoder;
  }

  public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
  public record LoginResponse(Long id, String nombre, String email, String rol) {}

  @PostMapping("/login")
  public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
    String email = req.email().trim().toLowerCase();
    String raw   = req.password().trim(); // <- por si Swagger mete espacios

    User u = repo.findByEmail(email).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario/contraseña inválidos"));

    if (u.getEstado() != EstadoUsuario.ACTIVO)
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario inactivo");

    if (!encoder.matches(raw, u.getPasswordHash()))
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario/contraseña inválidos");

    return ResponseEntity.ok(new LoginResponse(u.getId(), u.getNombre(), u.getEmail(), u.getRol().name()));
  }

}
