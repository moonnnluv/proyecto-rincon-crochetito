package com.crochet.crochet.services;

import java.util.List;
import com.crochet.crochet.entities.EstadoUsuario;
import com.crochet.crochet.entities.User;

public interface UserServices {
    List<User> listar();
    User obtener(Long id);

    User crear(User u, String rawPassword);

    User actualizar(Long id, User cambios);

    void cambiarPassword(Long id, String rawPassword);

    User cambiarEstado(Long id, EstadoUsuario nuevoEstado);

    void eliminar(Long id);

    User login(String email, String rawPassword);
}
