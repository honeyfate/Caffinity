// PaymentService.java - Complete implementation
package com.caffinity.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.caffinity.demo.entity.*;
import com.caffinity.demo.repository.OrderRepository;
import com.caffinity.demo.repository.PaymentRepository;

import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Transactional
    public Payment createPayment(Long orderId, PaymentMethod paymentMethod, Double amount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        // Check if payment already exists
        if (paymentRepository.findByOrderId(orderId).isPresent()) {
            throw new RuntimeException("Payment already exists for this order");
        }
        
        Payment payment = new Payment(order, paymentMethod, amount);
        Payment savedPayment = paymentRepository.save(payment);
        
        // Update order status to PAYMENT_PENDING
        order.setStatus(OrderStatus.PAYMENT_PENDING);
        orderRepository.save(order);
        
        return savedPayment;
    }

    @Transactional
    public Payment completePayment(Long paymentId, String transactionId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));
        
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setTransactionId(transactionId);
        
        // Update order status to CONFIRMED
        Order order = payment.getOrder();
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);
        
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment failPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));
        
        payment.setStatus(PaymentStatus.FAILED);
        
        // Update order status to PAYMENT_FAILED
        Order order = payment.getOrder();
        order.setStatus(OrderStatus.PAYMENT_FAILED);
        orderRepository.save(order);
        
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment failPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for order id: " + orderId));
        
        return failPayment(payment.getId());
    }

    public Optional<Payment> getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<Payment> getPaymentsByStatus(PaymentStatus status) {
        return paymentRepository.findByStatus(status);
    }

    // Statistics
    public Double getTotalRevenue() {
        return paymentRepository.getTotalRevenue();
    }

    public long getPaymentCountByStatus(PaymentStatus status) {
        return paymentRepository.countByStatus(status);
    }
}