package com.caffinity.demo.repository;

import com.caffinity.demo.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartRepository extends JpaRepository<Cart, String> {
    List<Cart> findByProductId(String productId);
    void deleteByCartId(String cartId);
}