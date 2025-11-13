package com.caffinity.demo.controller;

import com.caffinity.demo.entity.Cart;
import com.caffinity.demo.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public List<Cart> getAllCartItems() {
        return cartService.getAllCartItems();
    }

    @GetMapping("/{cartId}")
    public ResponseEntity<Cart> getCartItemById(@PathVariable String cartId) {
        Optional<Cart> cart = cartService.getCartItemById(cartId);
        return cart.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/product/{productId}")
    public List<Cart> getCartItemsByProductId(@PathVariable String productId) {
        return cartService.getCartItemsByProductId(productId);
    }

    @PostMapping
    public Cart createCartItem(@RequestBody Cart cart) {
        return cartService.saveCartItem(cart);
    }

    @PutMapping("/{cartId}")
    public ResponseEntity<Cart> updateCartItem(@PathVariable String cartId, @RequestBody Cart cartDetails) {
        Optional<Cart> optionalCart = cartService.getCartItemById(cartId);
        if (optionalCart.isPresent()) {
            Cart cart = optionalCart.get();
            cart.setProductId(cartDetails.getProductId());
            cart.setQuantity(cartDetails.getQuantity());
            cart.setDateAdded(cartDetails.getDateAdded());
            return ResponseEntity.ok(cartService.saveCartItem(cart));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{cartId}")
    public ResponseEntity<Void> deleteCartItem(@PathVariable String cartId) {
        if (cartService.cartItemExists(cartId)) {
            cartService.deleteCartItem(cartId);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}