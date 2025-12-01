package com.caffinity.demo.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.caffinity.demo.entity.Cart;
import com.caffinity.demo.service.CartService;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {
    
    @Autowired
    private CartService cartService;
    
    @GetMapping
    public ResponseEntity<Cart> getCart(
            @RequestHeader("X-Session-Id") String sessionId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) { // CHANGED to required = false
        try {
            Cart cart = cartService.getOrCreateCart(sessionId, userId);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(
            @RequestHeader("X-Session-Id") String sessionId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId, // CHANGED to required = false
            @RequestBody AddToCartRequest request) {
        try {
            Cart cart = cartService.addToCart(sessionId, request.getProductId(), request.getQuantity(), userId);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/update")
    public ResponseEntity<Cart> updateCartItem(
            @RequestHeader("X-Session-Id") String sessionId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId, // CHANGED to required = false
            @RequestBody UpdateCartRequest request) {
        try {
            Cart cart = cartService.updateCartItem(sessionId, request.getProductId(), request.getQuantity(), userId);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Cart> removeFromCart(
            @RequestHeader("X-Session-Id") String sessionId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId, // CHANGED to required = false
            @PathVariable Long productId) {
        try {
            Cart cart = cartService.removeFromCart(sessionId, productId, userId);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, String>> clearCart(
            @RequestHeader("X-Session-Id") String sessionId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) { // CHANGED to required = false
        try {
            cartService.clearCart(sessionId, userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Cart cleared successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // ADD THIS ENDPOINT FOR CART MIGRATION
    @PostMapping("/migrate")
    public ResponseEntity<Map<String, String>> migrateCart(
            @RequestHeader("X-Session-Id") String sessionId,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            cartService.migrateGuestCartToUser(sessionId, userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Cart migrated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Request DTOs
    public static class AddToCartRequest {
        private Long productId;
        private Integer quantity;
        
        // Getters and Setters
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
    
    public static class UpdateCartRequest {
        private Long productId;
        private Integer quantity;
        
        // Getters and Setters
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}