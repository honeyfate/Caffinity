package com.caffinity.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.caffinity.demo.entity.Cart;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findBySessionId(String sessionId);
    
    @Modifying
    @Query("DELETE FROM Cart c WHERE c.sessionId = :sessionId")
    void deleteBySessionId(@Param("sessionId") String sessionId);
    
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.cartItems WHERE c.sessionId = :sessionId")
    Optional<Cart> findBySessionIdWithItems(@Param("sessionId") String sessionId);
    
    // CUSTOM METHODS FOR CUSTOM FIELD NAMES
    @Query("SELECT c FROM Cart c WHERE c.cartId = :cartId")
    Optional<Cart> findByCartId(@Param("cartId") Long cartId);
    
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Cart c WHERE c.cartId = :cartId")
    boolean existsByCartId(@Param("cartId") Long cartId);
    
    // Custom delete method
    @Modifying
    @Query("DELETE FROM Cart c WHERE c.cartId = :cartId")
    void deleteByCartId(@Param("cartId") Long cartId);
    
    // Find carts by multiple cart IDs
    @Query("SELECT c FROM Cart c WHERE c.cartId IN :cartIds")
    java.util.List<Cart> findByCartIds(@Param("cartIds") java.util.List<Long> cartIds);
}