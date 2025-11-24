package com.crochet.crochet.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Boleta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 50)
    private String numero;     // Ej: B-1, B-2...

    private LocalDateTime fecha;

    // 🔹 Id del usuario dueño de la boleta (coincide con columna id_usuario en la BD)
    @Column(name = "id_usuario")
    private Long idUsuario;

    // Datos básicos del cliente
    @Column(length = 120)
    private String clienteNombre;

    @Column(length = 20)
    private String clienteRut;

    @Column(length = 120)
    private String clienteEmail;

    @Column(length = 200)
    private String clienteDireccion;

    // Totales
    private Long subtotal;   // sin IVA
    private Long iva;        // IVA calculado
    private Long total;      // con IVA

    @OneToMany(
        mappedBy = "boleta",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.EAGER
    )
    @Builder.Default
    private List<BoletaDetalle> detalles = new ArrayList<>();
}
