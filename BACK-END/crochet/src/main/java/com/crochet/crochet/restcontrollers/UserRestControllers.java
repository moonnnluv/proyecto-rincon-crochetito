package com.crochet.crochet.restcontrollers;

import java.net.URI;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.crochet.crochet.entities.EstadoUsuario;
import com.crochet.crochet.entities.Rol;
import com.crochet.crochet.entities.User;
import com.crochet.crochet.services.UserServices;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin
@Tag(name = "Usuario", description = "Operaciones relacionadas con los usuarios de crochet")
@Validated
public class UserRestControllers {

    private final UserServices service;
    public UserRestControllers(UserServices service){ this.service = service; }

    @Operation(summary = "Listar todos los usuarios")
    @GetMapping
    public List<User> listar(){ return service.listar(); }

    @Operation(summary = "Obtener un usuario por ID")
    @GetMapping("/{id}")
    public User obtener(@PathVariable Long id){ return service.obtener(id); }

    /* ===== DTOs con validaciones ===== */
    public record CreateUserDTO(
        @NotBlank @Size(max=100) String nombre,
        @NotBlank @Email @Size(max=120) String email,
        @NotBlank @Size(min=8, max=100) String password,
        String rol // opcional
    ) {}

    public record UpdateUserDTO(
        @Size(max=100) String nombre,
        @Email @Size(max=120) String email,
        String rol,     // opcional
        String estado   // opcional
    ) {}

    public record PasswordDTO(@NotBlank @Size(min=8, max=100) String password) {}

    /* === DTOs para LOGIN (inline) === */
    public record LoginDTO(
        @NotBlank @Email String email,
        @NotBlank @Size(min=8, max=100) String password
    ) {}
    /** Respuesta segura sin contraseña */
    public record UserView(Long id, String nombre, String email, String rol, String estado) {}

    /* ===== Helpers para parsear enums con 400 en caso inválido ===== */
    private Rol parseRol(String valor){
        if (valor == null) return null;
        try { return Rol.valueOf(valor.trim().toUpperCase()); }
        catch (IllegalArgumentException ex) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol inválido"); }
    }
    private EstadoUsuario parseEstado(String valor){
        if (valor == null) return null;
        try { return EstadoUsuario.valueOf(valor.trim().toUpperCase()); }
        catch (IllegalArgumentException ex) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado inválido"); }
    }

    @Operation(summary = "Crear un nuevo usuario")
    @PostMapping
    public ResponseEntity<User> crear(@Valid @RequestBody CreateUserDTO dto){
        User u = new User();
        u.setNombre(dto.nombre());
        u.setEmail(dto.email());
        var rol = parseRol(dto.rol());
        if (rol != null) u.setRol(rol);

        User creado = service.crear(u, dto.password());

        URI location = URI.create("/api/usuarios/" + creado.getId());
        return ResponseEntity.created(location).body(creado);
    }

    @Operation(summary = "Actualizar un usuario existente")
    @PutMapping("/{id}")
    public User actualizar(@PathVariable Long id, @Valid @RequestBody UpdateUserDTO dto){
        User cambios = new User();
        cambios.setNombre(dto.nombre());
        cambios.setEmail(dto.email());
        var rol = parseRol(dto.rol());
        var estado = parseEstado(dto.estado());
        if (rol != null) cambios.setRol(rol);
        if (estado != null) cambios.setEstado(estado);
        return service.actualizar(id, cambios);
    }

    @Operation(summary = "Cambiar la contraseña de un usuario")
    @PatchMapping("/{id}/password")
    public ResponseEntity<Void> cambiarPassword(@PathVariable Long id, @Valid @RequestBody PasswordDTO dto){
        service.cambiarPassword(id, dto.password());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Cambiar el estado de un usuario")
    @PatchMapping("/{id}/estado")
    public User cambiarEstado(@PathVariable Long id, @RequestParam String estado){
        return service.cambiarEstado(id, parseEstado(estado));
    }

    @Operation(summary = "Eliminar un usuario por ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id){
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    /* ===== LOGIN real contra BD (bcrypt) ===== */
    @Operation(summary = "Login de usuario (email + password)")
    @PostMapping("/login")
    public UserView login(@Valid @RequestBody LoginDTO dto){
        User u = service.login(dto.email(), dto.password()); // compara bcrypt y valida estado
        return new UserView(
            u.getId(),
            u.getNombre(),
            u.getEmail(),
            u.getRol() != null ? u.getRol().name() : null,
            u.getEstado() != null ? u.getEstado().name() : null
        );
    }
}
