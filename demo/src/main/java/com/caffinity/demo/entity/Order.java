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
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
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
   
    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;
   
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status = OrderStatus.PENDING;
   
    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;
   
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
   
    // Payment fields
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;
 
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
 
    @Column(name = "payment_amount")
    private Double paymentAmount;
 
    @Column(name = "transaction_id")
    private String transactionId;
 
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();
   
    // Constructors
    public Order() {
        this.orderDate = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
   
    public Order(User user, Double totalAmount) {
        this();
        this.user = user;
        this.totalAmount = totalAmount;
    }
   
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        this.orderDate = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
       
        // Initialize payment status if not set
        if (this.paymentStatus == null) {
            this.paymentStatus = PaymentStatus.PENDING;
        }
       
        // Initialize order status if not set
        if (this.status == null) {
            this.status = OrderStatus.PENDING;
        }
       
        // Set payment amount to total amount if not specified
        if (this.paymentAmount == null && this.totalAmount != null) {
            this.paymentAmount = this.totalAmount;
        }
    }
   
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
   
    // Getters and Setters
    public Long getOrderId() {
        return orderId;
    }
   
    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }
   
    public User getUser() {
        return user;
    }
   
    public void setUser(User user) {
        this.user = user;
    }
   
    public Double getTotalAmount() {
        return totalAmount;
    }
   
    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
       
        // Also update payment amount if it's null or needs to match total
        if (this.paymentAmount == null || this.paymentAmount.equals(this.totalAmount)) {
            this.paymentAmount = totalAmount;
        }
    }
   
    public OrderStatus getStatus() {
        return status;
    }
   
    public void setStatus(OrderStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
   
    public LocalDateTime getOrderDate() {
        return orderDate;
    }
   
    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }
   
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
   
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
   
    public List<OrderItem> getOrderItems() {
        return orderItems;
    }
   
    public void setOrderItems(List<OrderItem> orderItems) {
        this.orderItems = orderItems;
    }
 
    // Payment getters/setters
    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }
   
    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
        this.updatedAt = LocalDateTime.now();
    }
 
    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }
   
    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
        this.updatedAt = LocalDateTime.now();
    }
 
    public Double getPaymentAmount() {
        return paymentAmount;
    }
   
    public void setPaymentAmount(Double paymentAmount) {
        this.paymentAmount = paymentAmount;
        this.updatedAt = LocalDateTime.now();
    }
 
    public String getTransactionId() {
        return transactionId;
    }
   
    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
        this.updatedAt = LocalDateTime.now();
    }
   
    // Helper methods
    public void addOrderItem(OrderItem orderItem) {
        orderItems.add(orderItem);
        orderItem.setOrder(this);
        calculateTotal();
    }
   
    public void removeOrderItem(OrderItem orderItem) {
        orderItems.remove(orderItem);
        orderItem.setOrder(null);
        calculateTotal();
    }
   
    // Calculate total from items
    public void calculateTotal() {
        if (orderItems != null && !orderItems.isEmpty()) {
            this.totalAmount = orderItems.stream()
                    .mapToDouble(OrderItem::getTotalPrice)
                    .sum();
           
            // Update payment amount to match total
            if (this.paymentAmount == null) {
                this.paymentAmount = this.totalAmount;
            }
        } else {
            this.totalAmount = 0.0;
        }
    }
   
    // Helper method to update all timestamps
    public void updateTimestamps() {
        this.updatedAt = LocalDateTime.now();
    }
   
    @Override
    public String toString() {
        return "Order{" +
                "orderId=" + orderId +
                ", userId=" + (user != null ? user.getUserId() : "null") +
                ", totalAmount=" + totalAmount +
                ", status=" + status +
                ", orderDate=" + orderDate +
                ", updatedAt=" + updatedAt +
                ", paymentMethod=" + paymentMethod +
                ", paymentStatus=" + paymentStatus +
                ", paymentAmount=" + paymentAmount +
                ", transactionId='" + transactionId + '\'' +
                ", orderItems=" + (orderItems != null ? orderItems.size() : 0) +
                '}';
    }
}