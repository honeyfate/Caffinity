package com.caffinity.demo.controller;

import com.caffinity.demo.entity.Product;
import com.caffinity.demo.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }
    
    @GetMapping("/coffee")
    public List<Product> getCoffeeProducts() {
        return productService.getCoffeeProducts();
    }
    
    @GetMapping("/desserts")
    public List<Product> getDessertProducts() {
        return productService.getDessertProducts();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Optional<Product> product = productService.getProductById(id);
        return product.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Product> createProduct(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("type") String type,
            @RequestParam("category") String category,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        
        try {
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setPrice(price);
            product.setType(type);
            product.setCategory(category);
            
            // Handle image file upload
            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = productService.saveImage(imageFile);
                product.setImageUrl(imageUrl);
            }
            
            Product savedProduct = productService.saveProduct(product);
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("category") String category,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        
        try {
            Optional<Product> optionalProduct = productService.getProductById(id);
            if (optionalProduct.isPresent()) {
                Product product = optionalProduct.get();
                product.setName(name);
                product.setDescription(description);
                product.setPrice(price);
                product.setCategory(category);
                
                // Handle image file update
                if (imageFile != null && !imageFile.isEmpty()) {
                    String imageUrl = productService.saveImage(imageFile);
                    product.setImageUrl(imageUrl);
                }
                
                Product updatedProduct = productService.saveProduct(product);
                return ResponseEntity.ok(updatedProduct);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }
}