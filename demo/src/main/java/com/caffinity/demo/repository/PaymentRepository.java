package com.caffinity.demo.repository;

import com.caffinity.demo.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    Optional<Payment> findByOrder_OrderId(String orderId);
    List<Payment> findByStatus(String status);
    List<Payment> findByTotalAmountGreaterThan(double amount);
}