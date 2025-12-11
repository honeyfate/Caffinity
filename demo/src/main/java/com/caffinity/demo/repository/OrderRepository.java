package com.caffinity.demo.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.caffinity.demo.entity.Order;
import com.caffinity.demo.entity.OrderStatus;
import com.caffinity.demo.entity.User;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Find orders by user
    List<Order> findByUser(User user);
    
    // Find orders by user ID - FIXED
    @Query("SELECT o FROM Order o WHERE o.user.userId = :userId")
    List<Order> findByUserId(@Param("userId") Long userId);
    
    // Find orders by status
    List<Order> findByStatus(OrderStatus status);
    
    // Find orders within date range
    List<Order> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Find recent orders with pagination
    List<Order> findTop10ByOrderByOrderDateDesc();
    
    // Find orders by user and status
    List<Order> findByUserAndStatus(User user, OrderStatus status);
    
    // *** FIXED: Now fetches products too ***
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.orderItems oi " +
           "LEFT JOIN FETCH oi.product p " +  // CRITICAL: Added product fetch
           "WHERE o.orderId = :orderId")
    Optional<Order> findByIdWithItems(@Param("orderId") Long orderId);
    
    // *** FIXED: Now fetches products too ***
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.orderItems oi " +
           "LEFT JOIN FETCH oi.product p " +  // CRITICAL: Added product fetch
           "WHERE o.user.userId = :userId " +
           "ORDER BY o.orderDate DESC")
    List<Order> findByUserIdWithItems(@Param("userId") Long userId);
    
    // Count orders by status
    long countByStatus(OrderStatus status);
    
    // Calculate total revenue
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = com.caffinity.demo.entity.OrderStatus.COMPLETED")
    Double getTotalRevenue();
    
    // CUSTOM METHODS FOR CUSTOM FIELD NAMES
    @Query("SELECT o FROM Order o WHERE o.orderId = :orderId")
    Optional<Order> findByOrderId(@Param("orderId") Long orderId);
    
    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM Order o WHERE o.orderId = :orderId")
    boolean existsByOrderId(@Param("orderId") Long orderId);
    
    // Custom delete method
    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM Order o WHERE o.orderId = :orderId")
    void deleteByOrderId(@Param("orderId") Long orderId);
    
    // Find orders by multiple order IDs
    @Query("SELECT o FROM Order o WHERE o.orderId IN :orderIds")
    List<Order> findByOrderIds(@Param("orderIds") List<Long> orderIds);
}