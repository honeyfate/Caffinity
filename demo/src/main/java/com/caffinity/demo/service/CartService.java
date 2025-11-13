package com.caffinity.demo.service;

import com.caffinity.demo.entity.Cart;
import com.caffinity.demo.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    public List<Cart> getAllCartItems() {
        return cartRepository.findAll();
    }

    public Optional<Cart> getCartItemById(String cartId) {
        return cartRepository.findById(cartId);
    }

    public List<Cart> getCartItemsByProductId(String productId) {
        return cartRepository.findByProductId(productId);
    }

    public Cart saveCartItem(Cart cart) {
        return cartRepository.save(cart);
    }

    public void deleteCartItem(String cartId) {
        cartRepository.deleteById(cartId);
    }

    public void deleteCartItemByCartId(String cartId) {
        cartRepository.deleteByCartId(cartId);
    }

    public boolean cartItemExists(String cartId) {
        return cartRepository.existsById(cartId);
    }
}