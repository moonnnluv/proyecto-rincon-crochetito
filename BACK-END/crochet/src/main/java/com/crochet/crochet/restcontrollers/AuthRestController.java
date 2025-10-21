package com.crochet.crochet.restcontrollers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.crochet.crochet.entities.User;
import com.crochet.crochet.services.AuthService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

@Tag(name = "Autenticación", description = "Operaciones relacionadas con la autenticación de usuarios")
@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class AuthRestController {

  private final AuthService authService;

  public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
  public record LoginResponse(Long id, String nombre, String email, String rol, String estado) {}

  @PostMapping("/login")
  public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
    User u = authService.login(req.email(), req.password());
    return ResponseEntity.ok(
      new LoginResponse(
        u.getId(),
        u.getNombre(),
        u.getEmail(),
        u.getRol() != null ? u.getRol().name() : null,
        u.getEstado() != null ? u.getEstado().name() : null
      )
    );
  }
}
