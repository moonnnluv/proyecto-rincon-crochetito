package com.crochet.crochet.restcontrollers;

import com.crochet.crochet.config.JwtUtils;
import com.crochet.crochet.entities.User;
import com.crochet.crochet.repository.UserRepository;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Tag(name = "Autenticación", description = "Operaciones relacionadas con la autenticación de usuarios")
@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class AuthRestController {

  private final AuthenticationManager authenticationManager;
  private final JwtUtils jwtUtils;
  private final UserRepository userRepository;

  public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

  public record LoginResponse(
          String token,
          Long id,
          String nombre,
          String email,
          String rol,
          String estado
  ) {}

  @PostMapping("/login")
  public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
    try {
      // 1) Spring Security valida usuario + contraseña (usa CustomUserDetailsService + BCrypt)
      var authToken = new UsernamePasswordAuthenticationToken(req.email(), req.password());
      authenticationManager.authenticate(authToken);

      // 2) Buscamos el usuario en la BD para devolver sus datos
      User u = userRepository.findByEmail(req.email().trim().toLowerCase())
              .orElseThrow(() -> new ResponseStatusException(
                      HttpStatus.UNAUTHORIZED, "Usuario/contraseña inválidos"));

      // 3) Generamos el JWT con el email
      String token = jwtUtils.generateToken(u.getEmail());

      // 4) Devolvemos token + datos del usuario
      return ResponseEntity.ok(
              new LoginResponse(
                      token,
                      u.getId(),
                      u.getNombre(),
                      u.getEmail(),
                      u.getRol() != null ? u.getRol().name() : null,
                      u.getEstado() != null ? u.getEstado().name() : null
              )
      );

    } catch (BadCredentialsException ex) {
      // Si la contraseña está mala → 401
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario/contraseña inválidos");
    }
  }
}
