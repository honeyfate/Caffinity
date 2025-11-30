package com.caffinity.demo.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private Double totalAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;
    
    @Column(nullable = false)
    private LocalDateTime orderDate;
    
    private LocalDateTime updatedAt;
    
    // Payment fields moved from Payment entity
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    private Double paymentAmount;

    private String transactionId;

    private String paymentDetails;

    private LocalDateTime paymentDate;

    private LocalDateTime paymentProcessedAt;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();
    
    // Constructors
    public Order() {
        this.orderDate = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.paymentDate = null;
    }
    
    public Order(User user, Double totalAmount) {
        this();
        this.user = user;
        this.totalAmount = totalAmount;
    }
    
    // Getters and Setters
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { 
        this.status = status; 
        this.updatedAt = LocalDateTime.now();
    }
    
    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public List<OrderItem> getOrderItems() { return orderItems; }
    public void setOrderItems(List<OrderItem> orderItems) { this.orderItems = orderItems; }

    // Payment getters/setters
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { 
        this.paymentStatus = paymentStatus; 
        this.updatedAt = LocalDateTime.now();
    }

    public Double getPaymentAmount() { return paymentAmount; }
    public void setPaymentAmount(Double paymentAmount) { this.paymentAmount = paymentAmount; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getPaymentDetails() { return paymentDetails; }
    public void setPaymentDetails(String paymentDetails) { this.paymentDetails = paymentDetails; }

    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }

    public LocalDateTime getPaymentProcessedAt() { return paymentProcessedAt; }
    public void setPaymentProcessedAt(LocalDateTime paymentProcessedAt) { this.paymentProcessedAt = paymentProcessedAt; }

    // Convenience methods for payment flow
    public void initiatePayment(PaymentMethod method, Double amount) {
        this.paymentMethod = method;
        this.paymentAmount = amount;
        this.paymentStatus = PaymentStatus.PENDING;
        this.paymentDate = LocalDateTime.now();
        this.setStatus(OrderStatus.PAYMENT_PENDING);
    }

    public void completePayment(String transactionId) {
        this.paymentStatus = PaymentStatus.COMPLETED;
        this.transactionId = transactionId;
        this.paymentProcessedAt = LocalDateTime.now();
        this.setStatus(OrderStatus.CONFIRMED);
    }

    public void failPayment() {
        this.paymentStatus = PaymentStatus.FAILED;
        this.paymentProcessedAt = LocalDateTime.now();
        this.setStatus(OrderStatus.PAYMENT_FAILED);
    }
    
    // Helper methods
    public void addOrderItem(OrderItem orderItem) {
        orderItems.add(orderItem);
        orderItem.setOrder(this);
    }
    
    public void removeOrderItem(OrderItem orderItem) {
        orderItems.remove(orderItem);
        orderItem.setOrder(null);
    }
    
    // Calculate total from items
    public void calculateTotal() {
        this.totalAmount = orderItems.stream()
                .mapToDouble(OrderItem::getTotalPrice)
                .sum();
    }
}