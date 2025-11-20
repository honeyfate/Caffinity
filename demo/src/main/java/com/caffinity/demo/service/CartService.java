package com.caffinity.demo.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.caffinity.demo.entity.Cart;
import com.caffinity.demo.entity.CartItem;
import com.caffinity.demo.entity.Product;
import com.caffinity.demo.repository.CartItemRepository;
import com.caffinity.demo.repository.CartRepository;
import com.caffinity.demo.repository.ProductRepository;

@Service
public class CartService {
    
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    public Cart getOrCreateCart(String sessionId) {
        return cartRepository.findBySessionIdWithItems(sessionId)
                .orElseGet(() -> {
                    Cart newCart = new Cart(sessionId);
                    return cartRepository.save(newCart);
                });
    }
    
    @Transactional
    public Cart addToCart(String sessionId, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(sessionId);
        Product product = productRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check if item already exists in cart
        Optional<CartItem> existingItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(productId))
                .findFirst();
        
        if (existingItem.isPresent()) {
            // Update quantity
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            // Add new item
            CartItem newItem = new CartItem(product, quantity, product.getPrice());
            cart.addCartItem(newItem);
            cartItemRepository.save(newItem);
        }
        
        return cartRepository.save(cart);
    }
    
    @Transactional
    public Cart updateCartItem(String sessionId, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(sessionId);
        
        if (quantity <= 0) {
            return removeFromCart(sessionId, productId);
        }
        
        Optional<CartItem> existingItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(productId))
                .findFirst();
        
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(quantity);
            cartItemRepository.save(item);
            return cartRepository.save(cart);
        }
        
        throw new RuntimeException("Cart item not found");
    }
    
    @Transactional
    public Cart removeFromCart(String sessionId, Long productId) {
        Cart cart = getOrCreateCart(sessionId);
        
        Optional<CartItem> itemToRemove = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(productId))
                .findFirst();
        
        if (itemToRemove.isPresent()) {
            CartItem item = itemToRemove.get();
            cart.removeCartItem(item);
            cartItemRepository.delete(item);
            return cartRepository.save(cart);
        }
        
        throw new RuntimeException("Cart item not found");
    }
    
    @Transactional
    public void clearCart(String sessionId) {
        Cart cart = getOrCreateCart(sessionId);
        cart.getCartItems().clear();
        cartRepository.save(cart);
    }
    
    @Transactional
    public void deleteCart(String sessionId) {
        cartRepository.deleteBySessionId(sessionId);
    }
}