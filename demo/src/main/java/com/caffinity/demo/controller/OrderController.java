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

    // Create new order from cart
    @PostMapping("/create")
    public ResponseEntity<?> createOrderFromCart(
            @RequestParam Long userId,
            @RequestParam String shippingAddress,
            @RequestParam(required = false) String customerNotes) {
        try {
            System.out.println("🔄 Received request to create order for user: " + userId);
            Order order = orderService.createOrderFromCart(userId, shippingAddress, customerNotes);
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
}