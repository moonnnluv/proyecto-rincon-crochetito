package com.crochet.crochet.restcontrollers;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.crochet.crochet.entities.EstadoUsuario;
import com.crochet.crochet.entities.Rol;
import com.crochet.crochet.entities.User;
import com.crochet.crochet.services.UserServices;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin
public class UserRestControllers {

    private final UserServices service;
    public UserRestControllers(UserServices service){ this.service = service; }

    @GetMapping public List<User> listar(){ return service.listar(); }
    @GetMapping("/{id}") public User obtener(@PathVariable Long id){ return service.obtener(id); }

    public record CreateUserDTO(String nombre, String email, String password, String rol){}
    public record UpdateUserDTO(String nombre, String email, String rol, String estado){}
    public record PasswordDTO(String password){}

    @PostMapping
    public User crear(@RequestBody CreateUserDTO dto){
        User u = new User();
        u.setNombre(dto.nombre());
        u.setEmail(dto.email());
        if (dto.rol()!=null) u.setRol(Rol.valueOf(dto.rol().toUpperCase()));
        return service.crear(u, dto.password());
    }

    @PutMapping("/{id}")
    public User actualizar(@PathVariable Long id, @RequestBody UpdateUserDTO dto){
        User cambios = new User();
        cambios.setNombre(dto.nombre());
        cambios.setEmail(dto.email());
        if (dto.rol()!=null)    cambios.setRol(Rol.valueOf(dto.rol().toUpperCase()));
        if (dto.estado()!=null) cambios.setEstado(EstadoUsuario.valueOf(dto.estado().toUpperCase()));
        return service.actualizar(id, cambios);
    }

    @PatchMapping("/{id}/password")
    public void cambiarPassword(@PathVariable Long id, @RequestBody PasswordDTO dto){
        service.cambiarPassword(id, dto.password());
    }

    @PatchMapping("/{id}/estado")
    public User cambiarEstado(@PathVariable Long id, @RequestParam EstadoUsuario estado){
        return service.cambiarEstado(id, estado);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id){ service.eliminar(id); }
}
