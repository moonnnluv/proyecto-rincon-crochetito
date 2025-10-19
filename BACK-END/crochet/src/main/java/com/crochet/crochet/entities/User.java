package com.crochet.crochet.entities;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usuarios",
    uniqueConstraints = @UniqueConstraint(name = "uk_usuarios_email", columnNames = "email"))
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;                  // id

    @Column(length = 100)
    private String nombre;           // nombre

    @Column(nullable = false, unique = true, length = 120)
    private String email;            // email

    /** Contraseña ENCRIPTADA (hash). No se devuelve en JSON. */
    // el hash es una representación encriptada de la contraseña
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "password_hash", nullable = false, length = 120)
    private String passwordHash;     // contraseña (encriptada)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Rol rol = Rol.CLIENTE;   // rol: CLIENTE, VENDEDOR, SUPERADMIN

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoUsuario estado = EstadoUsuario.ACTIVO; // estado: ACTIVO, INACTIVO

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;  // fecha de creación (sistema)

    @PrePersist
    void prePersist() {
        this.creadoEn = LocalDateTime.now();
        if (email != null) email = email.trim().toLowerCase();
        if (nombre != null) nombre = nombre.trim();
    }
}
