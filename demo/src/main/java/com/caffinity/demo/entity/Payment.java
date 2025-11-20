package com.caffinity.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;
    
    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;
    
    @Column(nullable = false)
    private Double amount;
    
    private String transactionId;
    
    private String paymentDetails;
    
    @Column(nullable = false)
    private LocalDateTime paymentDate;
    
    private LocalDateTime processedAt;
    
    // Constructors
    public Payment() {
        this.paymentDate = LocalDateTime.now();
    }
    
    public Payment(Order order, PaymentMethod paymentMethod, Double amount) {
        this();
        this.order = order;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
    }
    
    // Getters and Setters
    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }
    
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { 
        this.status = status;
        if (status == PaymentStatus.COMPLETED) {
            this.processedAt = LocalDateTime.now();
        }
    }
    
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    
    public String getPaymentDetails() { return paymentDetails; }
    public void setPaymentDetails(String paymentDetails) { this.paymentDetails = paymentDetails; }
    
    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }
    
    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
}