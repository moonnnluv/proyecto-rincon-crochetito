package com.crochet.crochet.restcontrollers;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.crochet.crochet.entities.Boleta;
import com.crochet.crochet.entities.BoletaDetalle;
import com.crochet.crochet.entities.Producto;
import com.crochet.crochet.entities.User;
import com.crochet.crochet.repository.ProductoRepositories;
import com.crochet.crochet.repository.UserRepository;
import com.crochet.crochet.services.BoletaService;

@RestController
@RequestMapping("/api/boletas")
@CrossOrigin(origins = "*")
public class BoletaRestController {

    @Autowired
    private BoletaService boletaService;

    @Autowired
    private ProductoRepositories productoRepositories;

    @Autowired
    private UserRepository usuarioRepository; // IMPORTANTE: Agregado para buscar usuario

    // ====== DTOs ======

    public static class BoletaItemRequest {
        private Long productoId;
        private Integer cantidad;
        public Long getProductoId() { return productoId; }
        public void setProductoId(Long productoId) { this.productoId = productoId; }
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    }

    public static class BoletaRequest {
        private Long usuarioId;
        private String email;
        private String nombre;
        private String apellidos;
        private String rut;
        private String telefono;
        private String direccion;
        private List<BoletaItemRequest> items;

        // Getters y Setters
        public Long getUsuarioId() { return usuarioId; }
        public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getApellidos() { return apellidos; }
        public void setApellidos(String apellidos) { this.apellidos = apellidos; }
        public String getRut() { return rut; }
        public void setRut(String rut) { this.rut = rut; }
        public String getTelefono() { return telefono; }
        public void setTelefono(String telefono) { this.telefono = telefono; }
        public String getDireccion() { return direccion; }
        public void setDireccion(String direccion) { this.direccion = direccion; }
        public List<BoletaItemRequest> getItems() { return items; }
        public void setItems(List<BoletaItemRequest> items) { this.items = items; }
    }

    // ====== Crear boleta ======

    @PostMapping
    public ResponseEntity<Boleta> crear(@RequestBody BoletaRequest request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La boleta debe contener productos");
        }

        List<BoletaDetalle> detalles = new ArrayList<>();
        long subtotal = 0L;

        for (BoletaItemRequest item : request.getItems()) {
            if (item == null || item.getCantidad() == null || item.getCantidad() <= 0) continue;

            Producto producto = productoRepositories.findById(item.getProductoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado: " + item.getProductoId()));

            long precioUnit = producto.getPrecio() != null ? producto.getPrecio() : 0L;
            long sub = precioUnit * item.getCantidad();

            BoletaDetalle det = BoletaDetalle.builder()
                    .producto(producto)
                    .cantidad(item.getCantidad())
                    .precioUnitario(precioUnit)
                    .subtotal(sub)
                    .build();

            detalles.add(det);
            subtotal += sub;
        }

        if (detalles.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No hay ítems válidos");
        }

        long iva = Math.round(subtotal * 0.19);
        long total = subtotal + iva;

        String nombreCompleto = (request.getNombre() != null ? request.getNombre().trim() : "");
        if (request.getApellidos() != null && !request.getApellidos().isBlank()) {
            if (!nombreCompleto.isEmpty()) nombreCompleto += " ";
            nombreCompleto += request.getApellidos().trim();
        }
        if (nombreCompleto.isEmpty()) nombreCompleto = "Invitado";

        Boleta boleta = Boleta.builder()
                .fecha(LocalDateTime.now())
                .clienteNombre(nombreCompleto)
                .clienteRut(request.getRut())
                .clienteEmail(request.getEmail())
                .clienteDireccion(request.getDireccion())
                .subtotal(subtotal)
                .iva(iva)
                .total(total)
                .detalles(new ArrayList<>())
                .build();

        // --- SOLUCIÓN AL ERROR 500 ---
        if (request.getUsuarioId() != null) {
            // Si el front manda ID, lo usamos
            boleta.setIdUsuario(request.getUsuarioId());
        } else if (request.getEmail() != null) {
            // Si no manda ID, buscamos al usuario por EMAIL
            User usuarioEncontrado = usuarioRepository.findByEmail(request.getEmail()).orElse(null);
            if (usuarioEncontrado != null) {
                boleta.setIdUsuario(usuarioEncontrado.getId());
            }
        }
        // -----------------------------

        for (BoletaDetalle det : detalles) {
            det.setBoleta(boleta);
            boleta.getDetalles().add(det);
        }

        Boleta guardada = boletaService.crear(boleta);

        if (guardada.getNumero() == null) {
            guardada.setNumero("B-" + guardada.getId());
            guardada = boletaService.crear(guardada);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }

    // ====== Listados ======

    @GetMapping
    public List<Boleta> listar() {
        return boletaService.obtenerTodas();
    }

    @GetMapping("/{id}")
    public Boleta obtener(@PathVariable Long id) {
        return boletaService.obtenerPorId(id);
    }

    @GetMapping("/por-email")
    public List<Boleta> listarPorEmail(@RequestParam("email") String email) {
        return boletaService.obtenerPorClienteEmail(email);
    }
}