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
    
    // Find orders by user ID
    List<Order> findByUserId(Long userId);
    
    // Find orders by status
    List<Order> findByStatus(OrderStatus status);
    
    // Find orders within date range
    List<Order> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Find recent orders with pagination
    List<Order> findTop10ByOrderByOrderDateDesc();
    
    // Find orders by user and status
    List<Order> findByUserAndStatus(User user, OrderStatus status);
    
    // Custom query to find orders with items eagerly loaded
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);
    
    // Custom query to find user orders with items
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.user.id = :userId ORDER BY o.orderDate DESC")
    List<Order> findByUserIdWithItems(@Param("userId") Long userId);
    
    // Count orders by status
    long countByStatus(OrderStatus status);
    
    // Calculate total revenue
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = com.caffinity.demo.entity.OrderStatus.COMPLETED")
    Double getTotalRevenue();
}