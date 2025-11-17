package com.caffinity.demo.repository;

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
    
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.sessionId = :sessionId AND ci.product.id = :productId")
    Optional<CartItem> findBySessionIdAndProductId(@Param("sessionId") String sessionId, @Param("productId") Long productId);
}