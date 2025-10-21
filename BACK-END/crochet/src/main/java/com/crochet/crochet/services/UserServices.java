package com.crochet.crochet.services;

import com.crochet.crochet.entities.EstadoUsuario;
import com.crochet.crochet.entities.User;

import java.util.List;

public interface UserServices {
  List<User> listar();
  User obtener(Long id);
  User crear(User u, String rawPassword);
  User actualizar(Long id, User cambios);
  void cambiarPassword(Long id, String rawPassword);
  User cambiarEstado(Long id, EstadoUsuario estado);
  void eliminar(Long id);
  User login(String email, String rawPassword);
}
