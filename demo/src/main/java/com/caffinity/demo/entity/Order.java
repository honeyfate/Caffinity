package com.caffinity.demo.entity;
 
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
 
@Entity
@Table(name = "orders")
public class Order {
 
    @Id
    private String orderId;
 
    private String customerName;
 
    private String orderDate;
 
    private String status;
 
    // Example relationship (optional)
    @OneToOne(mappedBy = "order")
    private Payment payment;
 
    public Order() {}
 
    public Order(String orderId, String customerName, String orderDate, String status) {
        this.orderId = orderId;
        this.customerName = customerName;
        this.orderDate = orderDate;
        this.status = status;
    }
 
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
 
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
 
    public String getOrderDate() { return orderDate; }
    public void setOrderDate(String orderDate) { this.orderDate = orderDate; }
 
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
 
    public Payment getPayment() { return payment; }
    public void setPayment(Payment payment) { this.payment = payment; }
}