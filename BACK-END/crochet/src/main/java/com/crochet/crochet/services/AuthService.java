package com.crochet.crochet.services;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.crochet.crochet.entities.EstadoUsuario;
import com.crochet.crochet.entities.User;
import com.crochet.crochet.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder encoder;

  /** Login real contra BD: compara bcrypt y valida que el usuario esté ACTIVO. */
  public User login(String email, String rawPassword) {
    String mail = email.trim().toLowerCase();

    User u = userRepository.findByEmailIgnoreCase(mail)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario/contraseña inválidos"));

    if (u.getEstado() != null && u.getEstado() != EstadoUsuario.ACTIVO) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario inactivo");
    }

    // OJO: tu entidad expone passwordHash
    if (!encoder.matches(rawPassword, u.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario/contraseña inválidos");
    }

    return u; // el controller lo mapea a una respuesta segura (sin contraseña)
  }
}
