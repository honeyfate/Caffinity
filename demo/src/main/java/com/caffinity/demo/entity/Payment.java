 package com.caffinity.demo.entity;
 
import jakarta.persistence.*;
 
@Entity
@Table(name = "payment")
public class Payment {
 
    @Id
    private String paymentId;
 
    @OneToOne
    @JoinColumn(name = "order_id", referencedColumnName = "orderId")
    private Order order;
 
    private double totalAmount;
 
    private String status;
 
    public Payment() {}
 
    public Payment(String paymentId, Order order, double totalAmount, String status) {
        this.paymentId = paymentId;
        this.order = order;
        this.totalAmount = totalAmount;
        this.status = status;
    }
 
    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
 
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
 
    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }
 
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
 