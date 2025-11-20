// PaymentRepository.java
package com.caffinity.demo.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.caffinity.demo.entity.Payment;
import com.caffinity.demo.entity.PaymentStatus;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    // Find payment by order ID - FIXED
    @Query("SELECT p FROM Payment p WHERE p.order.orderId = :orderId")
    Optional<Payment> findByOrderId(@Param("orderId") Long orderId);
    
    // Find payments by status
    List<Payment> findByStatus(PaymentStatus status);
    
    // Find payments by payment method
    @Query("SELECT p FROM Payment p WHERE p.paymentMethod = :paymentMethod")
    List<Payment> findByPaymentMethod(@Param("paymentMethod") String paymentMethod);
    
    // Find payments within date range
    List<Payment> findByPaymentDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Calculate total revenue from completed payments
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'COMPLETED'")
    Double getTotalRevenue();
    
    // Count payments by status
    long countByStatus(PaymentStatus status);
    
    // Find recent payments with limit
    @Query("SELECT p FROM Payment p ORDER BY p.paymentDate DESC LIMIT :limit")
    List<Payment> findRecentPayments(@Param("limit") int limit);
    
    // Find payments by order IDs - UPDATED
    @Query("SELECT p FROM Payment p WHERE p.order.orderId IN :orderIds")
    List<Payment> findByOrderIds(@Param("orderIds") List<Long> orderIds);
    
    // CUSTOM METHODS FOR CUSTOM FIELD NAMES
    @Query("SELECT p FROM Payment p WHERE p.paymentId = :paymentId")
    Optional<Payment> findByPaymentId(@Param("paymentId") Long paymentId);
    
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Payment p WHERE p.paymentId = :paymentId")
    boolean existsByPaymentId(@Param("paymentId") Long paymentId);
    
    // Custom delete method
    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM Payment p WHERE p.paymentId = :paymentId")
    void deleteByPaymentId(@Param("paymentId") Long paymentId);
}