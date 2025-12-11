package com.caffinity.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional; // ADD THIS IMPORT

import com.caffinity.demo.entity.Cart;
import com.caffinity.demo.entity.CartItem;
import com.caffinity.demo.entity.User;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findBySessionId(String sessionId);
    
    // ADD THESE METHODS FOR USER SUPPORT:
    Optional<Cart> findByUser(User user);
    
    // NEW: Find cart by user ID
    @Query("SELECT c FROM Cart c WHERE c.user.userId = :userId")
    Optional<Cart> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.cartItems WHERE c.sessionId = :sessionId")
    Optional<Cart> findBySessionIdWithItems(@Param("sessionId") String sessionId);
    
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.cartItems WHERE c.user = :user")
    Optional<Cart> findByUserWithItems(@Param("user") User user);
    
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.cartItems WHERE c.sessionId = :sessionId OR c.user = :user")
    Optional<Cart> findBySessionIdOrUserWithItems(@Param("sessionId") String sessionId, @Param("user") User user);
    
    @Modifying
    @Query("DELETE FROM Cart c WHERE c.sessionId = :sessionId")
    void deleteBySessionId(@Param("sessionId") String sessionId);
    
    // NEW: Delete cart by user ID
    @Modifying
    @Query("DELETE FROM Cart c WHERE c.user.userId = :userId")
    void deleteByUserId(@Param("userId") Long userId);
    
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
    List<Cart> findByCartIds(@Param("cartIds") List<Long> cartIds);
    
    // NEW: Find cart items by user ID and product ID
    @Query("SELECT ci FROM CartItem ci JOIN ci.cart c WHERE c.user.userId = :userId AND ci.product.productId = :productId")
    List<CartItem> findCartItemsByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);
    
    // NEW: Delete cart items
    @Modifying
    @Transactional
    @Query("DELETE FROM CartItem ci WHERE ci IN :cartItems")
    void deleteCartItems(@Param("cartItems") List<CartItem> cartItems);
    
    // NEW: Find cart by user ID with items
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.cartItems WHERE c.user.userId = :userId")
    Optional<Cart> findByUserIdWithItems(@Param("userId") Long userId);
    
    // NEW: Check if user has a cart
    @Query("SELECT COUNT(c) > 0 FROM Cart c WHERE c.user.userId = :userId")
    boolean existsByUserId(@Param("userId") Long userId);
}