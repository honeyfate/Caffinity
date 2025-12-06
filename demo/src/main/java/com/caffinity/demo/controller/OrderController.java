package com.caffinity.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.caffinity.demo.entity.Order;
import com.caffinity.demo.entity.OrderStatus;
import com.caffinity.demo.service.OrderService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // NEW: Create order from frontend with customer info and order items
    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestBody CreateOrderRequest request) {
        try {
            System.out.println("🔄 Received order creation request from frontend for user: " + userId);
            Order order = orderService.createOrderFromFrontend(userId, request);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            System.err.println("❌ Error creating order: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating order: " + e.getMessage());
        }
    }

    // Create new order from cart - UPDATED
    @PostMapping("/create")
    public ResponseEntity<?> createOrderFromCart(
            @RequestParam Long userId) {
        try {
            System.out.println("🔄 Received request to create order for user: " + userId);
            Order order = orderService.createOrderFromCart(userId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            System.err.println("❌ Error creating order: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error creating order: " + e.getMessage());
        }
    }

    // Get all orders (for admin)
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        try {
            List<Order> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.err.println("❌ Error fetching orders: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get order by ID
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        try {
            Optional<Order> order = orderService.getOrderByIdWithItems(id);
            return order.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("❌ Error fetching order: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get orders by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable Long userId) {
        try {
            List<Order> orders = orderService.getOrdersByUserId(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.err.println("❌ Error fetching user orders: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get orders by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable OrderStatus status) {
        try {
            List<Order> orders = orderService.getOrdersByStatus(status);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.err.println("❌ Error fetching orders by status: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Update order status
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {
        try {
            System.out.println("🔄 Updating order " + orderId + " status to: " + status);
            Order order = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            System.err.println("❌ Error updating order status: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error updating order status: " + e.getMessage());
        }
    }

    // Cancel order
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        try {
            System.out.println("🔄 Cancelling order: " + orderId);
            Order order = orderService.cancelOrder(orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            System.err.println("❌ Error cancelling order: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error cancelling order: " + e.getMessage());
        }
    }

    // Get order statistics (for admin dashboard)
    @GetMapping("/statistics")
    public ResponseEntity<OrderService.OrderStatistics> getOrderStatistics() {
        try {
            OrderService.OrderStatistics stats = orderService.getOrderStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("❌ Error fetching order statistics: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get recent orders
    @GetMapping("/recent")
    public ResponseEntity<List<Order>> getRecentOrders() {
        try {
            List<Order> orders = orderService.getRecentOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.err.println("❌ Error fetching recent orders: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // DTO for create order request from frontend
    public static class CreateOrderRequest {
        private String customerName;
        private String customerPhone;
        private Double totalAmount;
        private java.util.List<OrderItemData> orderItems;
        private String paymentMethod;
        private String paymentStatus;

        // Getters and Setters
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }

        public String getCustomerPhone() { return customerPhone; }
        public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

        public Double getTotalAmount() { return totalAmount; }
        public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

        public java.util.List<OrderItemData> getOrderItems() { return orderItems; }
        public void setOrderItems(java.util.List<OrderItemData> orderItems) { this.orderItems = orderItems; }

        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

        public String getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    }

    // DTO for order items within the request
    public static class OrderItemData {
        private Long productId;
        private String productName;
        private Integer quantity;
        private Double price;
        private Double totalPrice;

        // Getters and Setters
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }

        public Double getTotalPrice() { return totalPrice; }
        public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
    }
}