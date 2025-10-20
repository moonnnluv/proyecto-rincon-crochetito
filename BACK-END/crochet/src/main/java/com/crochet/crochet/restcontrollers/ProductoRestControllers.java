package com.crochet.crochet.restcontrollers;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.crochet.crochet.entities.Producto;
import com.crochet.crochet.entities.Rol;
import com.crochet.crochet.repository.UserRepository;
import com.crochet.crochet.repository.ProductoRepositories; 
import com.crochet.crochet.services.ProductoServices;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Producto", description = "Operaciones relacionadas con los productos de crochet")
@RestController
@RequestMapping("/api/productos")
public class ProductoRestControllers {

    @Autowired private UserRepository userRepository;
    @Autowired private ProductoServices productoServices;
    @Autowired private ProductoRepositories productoRepositories;

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    private void validarAdmin(Long adminId) {
        if (adminId == null) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Falta X-ADMIN-ID");
        var u = userRepository.findById(adminId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin no existe"));
        if (u.getRol() != Rol.SUPERADMIN) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado");
        }
    }

    @Operation(summary = "Crear un nuevo producto")
    @PostMapping
    public ResponseEntity<Producto> crearProducto(@RequestBody Producto producto) {
        return ResponseEntity.ok(productoServices.crear(producto));
    }

    @Operation(summary = "Obtener un producto por ID")
    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerProductoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(productoServices.obtenerId(id));
    }

    @Operation(summary = "Listar todos los productos")
    @GetMapping
    public ResponseEntity<List<Producto>> listarProductos() {
        return ResponseEntity.ok(productoServices.obtenerTodos());
    }

    @Operation(summary = "Eliminar un producto por ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        productoServices.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Actualizar un producto por ID")
    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(
        @PathVariable Long id, @RequestBody Producto productoActualizado) {
        return ResponseEntity.ok(productoServices.actualizar(id, productoActualizado));
    }

    @Operation(summary = "Desactivar un producto por ID")
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Producto> desactivar(@PathVariable Long id) {
        return ResponseEntity.ok(productoServices.desactivar(id));
    }

    // ---------- SUBIDA DE IMAGEN ----------
    @Operation(summary = "Subir imagen de producto y guardar URL")
    @PostMapping(
        path = "/{id}/imagen",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, String>> subirImagen(
        @PathVariable Long id,
        @RequestParam("file") MultipartFile file,
        @RequestHeader(value = "X-ADMIN-ID", required = false) Long adminId
    ) throws IOException {

        validarAdmin(adminId);

        var producto = productoRepositories.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no existe"));

        Path dir = Paths.get(uploadDir).toAbsolutePath();
        Files.createDirectories(dir);

        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains(".")) ? original.substring(original.lastIndexOf('.')) : ".jpg";
        String filename = UUID.randomUUID() + ext.toLowerCase();
        Path destino = dir.resolve(filename);

        file.transferTo(destino.toFile());

        String url = ServletUriComponentsBuilder.fromCurrentContextPath()
            .path("/uploads/").path(filename).toUriString();

        producto.setImagen(url);
        productoRepositories.save(producto);

        return ResponseEntity.ok(Map.of("url", url));
    }
}
