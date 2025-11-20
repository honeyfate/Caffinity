package com.caffinity.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.caffinity.demo.entity.OrderItem;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    // Find order items by order ID - FIXED
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.orderId = :orderId")
    List<OrderItem> findByOrderId(@Param("orderId") Long orderId);
    
    // Find order items by product ID - FIXED
    @Query("SELECT oi FROM OrderItem oi WHERE oi.product.productId = :productId")
    List<OrderItem> findByProductId(@Param("productId") Long productId);
    
    // Custom query to get popular products - UPDATED
    @Query("SELECT oi.product.productId, SUM(oi.quantity) as totalSold " +
        "FROM OrderItem oi " +
        "GROUP BY oi.product.productId " +
        "ORDER BY totalSold DESC")
    List<Object[]> findPopularProducts();
    
    // Get total quantity sold for a product - UPDATED
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.product.productId = :productId")
    Integer getTotalQuantitySoldByProductId(@Param("productId") Long productId);
    
    // CUSTOM METHODS FOR CUSTOM FIELD NAMES
    @Query("SELECT oi FROM OrderItem oi WHERE oi.orderItemId = :orderItemId")
    Optional<OrderItem> findByOrderItemId(@Param("orderItemId") Long orderItemId);
    
    @Query("SELECT CASE WHEN COUNT(oi) > 0 THEN true ELSE false END FROM OrderItem oi WHERE oi.orderItemId = :orderItemId")
    boolean existsByOrderItemId(@Param("orderItemId") Long orderItemId);
    
    // Custom delete method
    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM OrderItem oi WHERE oi.orderItemId = :orderItemId")
    void deleteByOrderItemId(@Param("orderItemId") Long orderItemId);
    
    // Find order items by multiple order item IDs
    @Query("SELECT oi FROM OrderItem oi WHERE oi.orderItemId IN :orderItemIds")
    List<OrderItem> findByOrderItemIds(@Param("orderItemIds") List<Long> orderItemIds);
}