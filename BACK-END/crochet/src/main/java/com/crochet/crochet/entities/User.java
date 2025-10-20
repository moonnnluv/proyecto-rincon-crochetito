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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
    private Long id; // id

    @NotBlank
    @Size(max = 100)
    @Column(length = 100, nullable = false)
    private String nombre; // nombre

    @NotBlank
    @Email
    @Size(max = 120)
    @Column(nullable = false, unique = true, length = 120)
    private String email; // email

    /** Hash BCrypt; no se devuelve en JSON */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @NotBlank
    @Size(min = 8, max = 100)
    @Column(name = "password", nullable = false, length = 100)
    private String passwordHash; // contraseña (encriptada)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Rol rol = Rol.CLIENTE; // CLIENTE, VENDEDOR, SUPERADMIN

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoUsuario estado = EstadoUsuario.ACTIVO; // ACTIVO, INACTIVO

    // La llena la BD con DEFAULT CURRENT_TIMESTAMP
    @Column(name = "fecha_creacion", insertable = false, updatable = false)
    private LocalDateTime creadoEn;

    @PrePersist
    @PreUpdate
    void normalize() {
        if (email != null) email = email.trim().toLowerCase();
        if (nombre != null) nombre = nombre.trim();
    }
}
