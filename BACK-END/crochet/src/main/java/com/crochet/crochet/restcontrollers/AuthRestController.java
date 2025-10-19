package com.crochet.crochet.restcontrollers;

import com.crochet.crochet.entities.User;
import com.crochet.crochet.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthRestController {

  private final UserRepository repo;
  private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

  public AuthRestController(UserRepository repo){ this.repo = repo; }

  public record LoginRequest(String email, String password) {}
  public record LoginResponse(String message, User user) {}

  @PostMapping("/login")
  public LoginResponse login(@RequestBody LoginRequest req){
    String email = req.email().trim().toLowerCase();
    User u = repo.findByEmail(email).orElseThrow(() -> new RuntimeException("Usuario/contraseña inválidos"));
    if (!encoder.matches(req.password(), u.getPasswordHash()))
      throw new RuntimeException("Usuario/contraseña inválidos");
    return new LoginResponse("ok", u); // password no viaja por @JsonProperty WRITE_ONLY
  }
}
