package com.caffinity.demo.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.caffinity.demo.entity.CartItem;
import com.caffinity.demo.entity.Product;
import com.caffinity.demo.repository.CartItemRepository;
import com.caffinity.demo.repository.ProductRepository;

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Value("${file.upload-dir:src/uploads}")
    private String uploadDir;
    
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public List<Product> getProductsByType(String type) {
        return productRepository.findByType(type);
    }
    
    public List<Product> getCoffeeProducts() {
        return productRepository.findByType("coffee");
    }
    
    public List<Product> getDessertProducts() {
        return productRepository.findByType("dessert");
    }
    
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
    
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }
    
    // UPDATED METHOD WITH COMPREHENSIVE DEBUGGING
    @Transactional
    public void deleteProduct(Long id) {
        try {
            System.out.println("=== STARTING PRODUCT DELETION FOR ID: " + id + " ===");
            
            // First, check if product exists
            Optional<Product> product = productRepository.findById(id);
            if (!product.isPresent()) {
                System.err.println("❌ Product not found with ID: " + id);
                throw new RuntimeException("Product not found with ID: " + id);
            }
            System.out.println("✅ Product found: " + product.get().getName());
            
            // Find and display cart items before deletion
            System.out.println("🔍 Searching for cart items with product ID: " + id);
            List<CartItem> cartItems = cartItemRepository.findByProductId(id);
            System.out.println("📦 Found " + cartItems.size() + " cart items to delete");
            
            if (!cartItems.isEmpty()) {
                cartItems.forEach(item -> 
                    System.out.println("   - Cart Item ID: " + item.getId() + ", Cart ID: " + 
                        (item.getCart() != null ? item.getCart().getId() : "null")));
                
                // Delete all cart items that reference this product
                System.out.println("🗑️ Deleting cart items using repository method...");
                cartItemRepository.deleteByProductId(id);
                System.out.println("✅ Cart items deleted successfully using repository method");
            } else {
                System.out.println("✅ No cart items found for this product");
            }
            
            // Verify cart items are gone
            List<CartItem> remainingItems = cartItemRepository.findByProductId(id);
            System.out.println("🔍 Verification: " + remainingItems.size() + " cart items remaining after deletion");
            
            // Then delete the product
            System.out.println("🗑️ Deleting product from database...");
            productRepository.deleteById(id);
            System.out.println("✅ Product deleted successfully from database");
            
            System.out.println("=== PRODUCT DELETION COMPLETED SUCCESSFULLY ===");
            
        } catch (Exception e) {
            System.err.println("❌ ERROR deleting product with ID " + id + ": " + e.getMessage());
            System.err.println("❌ Error type: " + e.getClass().getName());
            System.err.println("❌ Stack trace:");
            e.printStackTrace();
            
            // Try alternative approach if the first one fails
            try {
                System.out.println("🔄 Attempting alternative deletion approach...");
                alternativeDeleteProduct(id);
            } catch (Exception altException) {
                System.err.println("❌ Alternative approach also failed: " + altException.getMessage());
                throw new RuntimeException("Failed to delete product after multiple attempts: " + e.getMessage(), e);
            }
        }
    }
    
    // Alternative deletion method
    @Transactional
    private void alternativeDeleteProduct(Long id) {
        try {
            System.out.println("=== ALTERNATIVE DELETION APPROACH ===");
            
            // Delete cart items using individual deletion
            List<CartItem> cartItems = cartItemRepository.findByProductId(id);
            System.out.println("Found " + cartItems.size() + " cart items for alternative deletion");
            
            if (!cartItems.isEmpty()) {
                // Delete each cart item individually
                for (CartItem cartItem : cartItems) {
                    System.out.println("Deleting cart item individually: " + cartItem.getId());
                    cartItemRepository.delete(cartItem);
                }
                System.out.println("All cart items deleted individually");
                
                // Flush to ensure deletions are committed
                cartItemRepository.flush();
            }
            
            // Now delete the product
            System.out.println("Deleting product using alternative method...");
            productRepository.deleteById(id);
            productRepository.flush();
            
            System.out.println("✅ Alternative deletion completed successfully");
            
        } catch (Exception e) {
            System.err.println("❌ Alternative deletion failed: " + e.getMessage());
            throw e;
        }
    }
    
    public Product updateProduct(Long id, Product productDetails) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isPresent()) {
            Product product = optionalProduct.get();
            product.setName(productDetails.getName());
            product.setDescription(productDetails.getDescription());
            product.setPrice(productDetails.getPrice());
            product.setCategory(productDetails.getCategory());
            product.setImageUrl(productDetails.getImageUrl());
            return productRepository.save(product);
        }
        return null;
    }
    
    // File upload method
    public String saveImage(MultipartFile file) throws IOException {
        // Use hardcoded path instead of @Value property
        String uploadDir = "src/uploads";
        
        // Create uploads directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + fileExtension;
        
        // Save file
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);
        
        // Return the file path that can be served statically
        // This will be accessible at http://localhost:8080/uploads/filename
        return "http://localhost:8080/uploads/" + fileName;
    }
}