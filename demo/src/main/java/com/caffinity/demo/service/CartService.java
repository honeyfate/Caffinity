package com.caffinity.demo.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.caffinity.demo.entity.Cart;
import com.caffinity.demo.entity.CartItem;
import com.caffinity.demo.entity.Product;
import com.caffinity.demo.entity.User;
import com.caffinity.demo.repository.CartItemRepository;
import com.caffinity.demo.repository.CartRepository;
import com.caffinity.demo.repository.ProductRepository;
import com.caffinity.demo.repository.UserRepository;

@Service
public class CartService {
    
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;
    
    // UPDATED: Handle both guest and authenticated users
    public Cart getOrCreateCart(String sessionId, Long userId) {
        User user = null;
        if (userId != null) {
            user = userRepository.findByUserId(userId).orElse(null);
        }
        
        // If user is authenticated, try to find their cart first
        if (user != null) {
            Optional<Cart> userCart = cartRepository.findByUserWithItems(user);
            if (userCart.isPresent()) {
                return userCart.get();
            }
        }
        
        // If no user cart found, try by session ID
        Optional<Cart> sessionCart = cartRepository.findBySessionIdWithItems(sessionId);
        if (sessionCart.isPresent()) {
            Cart cart = sessionCart.get();
            // If user is authenticated but cart wasn't associated, associate it now
            if (user != null && cart.getUser() == null) {
                cart.setUser(user);
                return cartRepository.save(cart);
            }
            return cart;
        }
        
        // Create new cart
        Cart newCart = new Cart(sessionId, user);
        return cartRepository.save(newCart);
    }
    
    @Transactional
    public Cart addToCart(String sessionId, Long productId, Integer quantity, Long userId) {
        Cart cart = getOrCreateCart(sessionId, userId);
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
    public Cart updateCartItem(String sessionId, Long productId, Integer quantity, Long userId) {
        Cart cart = getOrCreateCart(sessionId, userId);
        
        if (quantity <= 0) {
            return removeFromCart(sessionId, productId, userId);
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
    public Cart removeFromCart(String sessionId, Long productId, Long userId) {
        Cart cart = getOrCreateCart(sessionId, userId);
        
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
    public void clearCart(String sessionId, Long userId) {
        Cart cart = getOrCreateCart(sessionId, userId);
        cart.getCartItems().clear();
        cartRepository.save(cart);
    }
    
    @Transactional
    public void deleteCart(String sessionId) {
        cartRepository.deleteBySessionId(sessionId);
    }
    
    // ADD THIS METHOD FOR CART MIGRATION WHEN USER LOGS IN
    @Transactional
    public void migrateGuestCartToUser(String sessionId, Long userId) {
        User user = userRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        Optional<Cart> guestCart = cartRepository.findBySessionIdWithItems(sessionId);
        Optional<Cart> userCart = cartRepository.findByUserWithItems(user);
        
        if (guestCart.isPresent() && userCart.isPresent()) {
            // Merge guest cart into user cart
            Cart guest = guestCart.get();
            Cart userCartObj = userCart.get();
            
            for (CartItem guestItem : guest.getCartItems()) {
                // Check if user already has this product in cart
                Optional<CartItem> existingItem = userCartObj.getCartItems().stream()
                    .filter(item -> item.getProduct().getProductId().equals(guestItem.getProduct().getProductId()))
                    .findFirst();
                
                if (existingItem.isPresent()) {
                    // Update quantity
                    CartItem item = existingItem.get();
                    item.setQuantity(item.getQuantity() + guestItem.getQuantity());
                    cartItemRepository.save(item);
                } else {
                    // Add new item
                    CartItem newItem = new CartItem(guestItem.getProduct(), guestItem.getQuantity(), guestItem.getPrice());
                    userCartObj.addCartItem(newItem);
                    cartItemRepository.save(newItem);
                }
            }
            
            // Delete guest cart
            cartRepository.delete(guest);
            
        } else if (guestCart.isPresent() && !userCart.isPresent()) {
            // Associate guest cart with user
            Cart cart = guestCart.get();
            cart.setUser(user);
            cartRepository.save(cart);
        }
        // If user cart exists but no guest cart, do nothing
    }
}