package com.crochet.crochet.restcontrollers;

import com.crochet.crochet.config.JwtUtils;
import com.crochet.crochet.entities.User;
import com.crochet.crochet.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthRestController.class)
@AutoConfigureMockMvc(addFilters = false) // desactiva filtros de Spring Security en el test
class AuthRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private UserRepository userRepository;

    @Test
    void login_con_credenciales_validas_retorna_200_y_token() throws Exception {
        // Usuario simulado de BD
        User user = new User();
        user.setId(1L);
        user.setNombre("Admin Crochetito");
        user.setEmail("admin@crochetito.cl");
        // rol / estado pueden quedar null, el controller ya los maneja

        // Spring Security "acepta" las credenciales
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        // Usuario encontrado en repositorio
        when(userRepository.findByEmail("admin@crochetito.cl")).thenReturn(Optional.of(user));
        // JwtUtils genera un token
        when(jwtUtils.generateToken("admin@crochetito.cl")).thenReturn("FAKE_JWT_TOKEN");

        String body = """
            {
              "email": "admin@crochetito.cl",
              "password": "12345678"
            }
            """;

        mockMvc.perform(
                post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
        )
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.token").value("FAKE_JWT_TOKEN"))
                .andExpect(jsonPath("$.email").value("admin@crochetito.cl"))
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void login_con_password_incorrecta_retorna_401() throws Exception {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        String body = """
            {
              "email": "admin@crochetito.cl",
              "password": "mala"
            }
            """;

        mockMvc.perform(
                post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
        )
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_cuando_usuario_no_existe_retorna_401() throws Exception {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        String body = """
            {
              "email": "noexiste@crochetito.cl",
              "password": "cualquier"
            }
            """;

        mockMvc.perform(
                post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
        )
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_con_email_invalido_retorna_400_por_validacion() throws Exception {
        // Ni siquiera debería llegar a llamar al AuthenticationManager
        String body = """
            {
              "email": "no-es-un-email",
              "password": "12345678"
            }
            """;

        mockMvc.perform(
                post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
        )
                .andExpect(status().isBadRequest());
    }
}
