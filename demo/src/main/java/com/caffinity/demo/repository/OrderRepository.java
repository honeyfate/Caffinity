package com.caffinity.demo.repository;

import com.caffinity.demo.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByCustomerName(String customerName);
    List<Order> findByStatus(String status);
    List<Order> findByOrderDate(String orderDate);
}