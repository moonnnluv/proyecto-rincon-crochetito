package com.crochet.crochet.restcontrollers;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.crochet.crochet.entities.Boleta;
import com.crochet.crochet.entities.BoletaDetalle;
import com.crochet.crochet.entities.Producto;
import com.crochet.crochet.repository.ProductoRepositories;
import com.crochet.crochet.services.BoletaService;

@RestController
@RequestMapping("/api/boletas")
@CrossOrigin(origins = "*")
public class BoletaRestController {

    @Autowired
    private BoletaService boletaService;

    @Autowired
    private ProductoRepositories productoRepositories;

    // ----- DTOs para recibir el carrito -----

    public static class BoletaItemRequest {
        private Long productoId;
        private Integer cantidad;

        public Long getProductoId() { return productoId; }
        public void setProductoId(Long productoId) { this.productoId = productoId; }

        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    }

    public static class BoletaRequest {
        private String clienteNombre;
        private String clienteRut;
        private String clienteEmail;
        private String clienteDireccion;
        private List<BoletaItemRequest> items;

        public String getClienteNombre() { return clienteNombre; }
        public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }

        public String getClienteRut() { return clienteRut; }
        public void setClienteRut(String clienteRut) { this.clienteRut = clienteRut; }

        public String getClienteEmail() { return clienteEmail; }
        public void setClienteEmail(String clienteEmail) { this.clienteEmail = clienteEmail; }

        public String getClienteDireccion() { return clienteDireccion; }
        public void setClienteDireccion(String clienteDireccion) { this.clienteDireccion = clienteDireccion; }

        public List<BoletaItemRequest> getItems() { return items; }
        public void setItems(List<BoletaItemRequest> items) { this.items = items; }
    }

    // ----- Crear boleta desde el carrito -----

    @PostMapping
    public ResponseEntity<Boleta> crear(@RequestBody BoletaRequest request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La boleta debe contener al menos un producto"
            );
        }

        List<BoletaDetalle> detalles = new ArrayList<>();
        long subtotal = 0L;

        for (BoletaItemRequest item : request.getItems()) {
            if (item == null || item.getCantidad() == null || item.getCantidad() <= 0) {
                continue;
            }

            Producto producto = productoRepositories.findById(item.getProductoId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Producto no encontrado: " + item.getProductoId()
                    ));

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
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No hay ítems válidos en la boleta"
            );
        }

        long iva = Math.round(subtotal * 0.19);
        long total = subtotal + iva;

        Boleta boleta = Boleta.builder()
                .fecha(LocalDateTime.now())
                .clienteNombre(request.getClienteNombre())
                .clienteRut(request.getClienteRut())
                .clienteEmail(request.getClienteEmail())
                .clienteDireccion(request.getClienteDireccion())
                .subtotal(subtotal)
                .iva(iva)
                .total(total)
                .build();

        for (BoletaDetalle det : detalles) {
            det.setBoleta(boleta);
            boleta.getDetalles().add(det);
        }

        // Guardar boleta
        Boleta guardada = boletaService.crear(boleta);

        // Generar número simple si no existe
        if (guardada.getNumero() == null) {
            guardada.setNumero("B-" + guardada.getId());
            guardada = boletaService.crear(guardada);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }

    // ----- Consultar boletas -----

    @GetMapping
    public List<Boleta> listar() {
        return boletaService.obtenerTodas();
    }

    @GetMapping("/{id}")
    public Boleta obtener(@PathVariable Long id) {
        return boletaService.obtenerPorId(id);
    }
}
