package com.caffinity.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.caffinity.demo.entity.CartItem;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.sessionId = :sessionId")
    void deleteBySessionId(@Param("sessionId") String sessionId);
    
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.sessionId = :sessionId AND ci.product.productId = :productId")
    Optional<CartItem> findBySessionIdAndProductId(@Param("sessionId") String sessionId, @Param("productId") Long productId);
    
    // NEW METHODS FOR BUG FIX
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.product.productId = :productId")
    void deleteByProductId(@Param("productId") Long productId);
    
    @Query("SELECT ci FROM CartItem ci WHERE ci.product.productId = :productId")
    List<CartItem> findByProductId(@Param("productId") Long productId);
    
    // CUSTOM METHODS FOR CUSTOM FIELD NAMES
    @Query("SELECT ci FROM CartItem ci WHERE ci.cartItemId = :cartItemId")
    Optional<CartItem> findByCartItemId(@Param("cartItemId") Long cartItemId);
    
    @Query("SELECT CASE WHEN COUNT(ci) > 0 THEN true ELSE false END FROM CartItem ci WHERE ci.cartItemId = :cartItemId")
    boolean existsByCartItemId(@Param("cartItemId") Long cartItemId);
    
    // Custom delete method
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cartItemId = :cartItemId")
    void deleteByCartItemId(@Param("cartItemId") Long cartItemId);
    
    // Find cart items by multiple cart item IDs
    @Query("SELECT ci FROM CartItem ci WHERE ci.cartItemId IN :cartItemIds")
    List<CartItem> findByCartItemIds(@Param("cartItemIds") List<Long> cartItemIds);
}