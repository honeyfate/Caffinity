package com.caffinity.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.caffinity.demo.entity.Cart;
import com.caffinity.demo.entity.CartItem;
import com.caffinity.demo.entity.Order;
import com.caffinity.demo.entity.OrderItem;
import com.caffinity.demo.entity.OrderStatus;
import com.caffinity.demo.entity.User;
import com.caffinity.demo.repository.CartRepository;
import com.caffinity.demo.repository.OrderItemRepository;
import com.caffinity.demo.repository.OrderRepository;
import com.caffinity.demo.repository.UserRepository;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    // Create order from cart - UPDATED
    @Transactional
    public Order createOrderFromCart(Long userId) {
        System.out.println("🔄 Creating order from cart for user ID: " + userId);
        
        try {
            // Get user
            User user = userRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
            
            // Get user's cart with items
            String sessionId = "user_" + userId; // Assuming session ID format
            Optional<Cart> cartOpt = cartRepository.findBySessionIdWithItems(sessionId);
            
            if (!cartOpt.isPresent() || cartOpt.get().getCartItems().isEmpty()) {
                throw new RuntimeException("Cart is empty or not found");
            }
            
            Cart cart = cartOpt.get();
            
            // Create new order
            Order order = new Order();
            order.setUser(user);
            order.setStatus(OrderStatus.PENDING);
            
            // Convert cart items to order items
            for (CartItem cartItem : cart.getCartItems()) {
                OrderItem orderItem = new OrderItem();
                orderItem.setProduct(cartItem.getProduct());
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setUnitPrice(cartItem.getPrice());
                order.addOrderItem(orderItem);
            }
            
            // Calculate total
            order.calculateTotal();
            
            // Save order
            Order savedOrder = orderRepository.save(order);
            System.out.println("✅ Order created successfully with ID: " + savedOrder.getOrderId());
            
            // Clear cart after successful order creation
            cartRepository.deleteBySessionId(sessionId);
            System.out.println("🛒 Cart cleared after order creation");
            
            return savedOrder;
            
        } catch (Exception e) {
            System.err.println("❌ Error creating order: " + e.getMessage());
            throw new RuntimeException("Failed to create order: " + e.getMessage(), e);
        }
    }

    // Get all orders
    public List<Order> getAllOrders() {
        System.out.println("📋 Fetching all orders");
        return orderRepository.findAll();
    }

    // Get order by ID
    public Optional<Order> getOrderById(Long id) {
        System.out.println("🔍 Fetching order by ID: " + id);
        return orderRepository.findByOrderId(id);
    }

    // Get order by ID with items
    public Optional<Order> getOrderByIdWithItems(Long id) {
        System.out.println("🔍 Fetching order with items by ID: " + id);
        return orderRepository.findByIdWithItems(id);
    }

    // Get orders by user ID
    public List<Order> getOrdersByUserId(Long userId) {
        System.out.println("📋 Fetching orders for user ID: " + userId);
        return orderRepository.findByUserIdWithItems(userId);
    }

    // Get orders by status
    public List<Order> getOrdersByStatus(OrderStatus status) {
        System.out.println("📋 Fetching orders with status: " + status);
        return orderRepository.findByStatus(status);
    }

    // Update order status
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        System.out.println("🔄 Updating order status for ID: " + orderId + " to: " + newStatus);
        
        try {
            Order order = orderRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
            
            order.setStatus(newStatus);
            Order updatedOrder = orderRepository.save(order);
            
            System.out.println("✅ Order status updated successfully");
            return updatedOrder;
            
        } catch (Exception e) {
            System.err.println("❌ Error updating order status: " + e.getMessage());
            throw new RuntimeException("Failed to update order status: " + e.getMessage(), e);
        }
    }

    // Cancel order
    @Transactional
    public Order cancelOrder(Long orderId) {
        System.out.println("🔄 Cancelling order ID: " + orderId);
        
        try {
            Order order = orderRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
            
            // Only allow cancellation for pending or confirmed orders
            if (order.getStatus() == OrderStatus.COMPLETED) {
                throw new RuntimeException("Cannot cancel completed order");
            }
            
            if (order.getStatus() == OrderStatus.CANCELLED) {
                throw new RuntimeException("Order is already cancelled");
            }
            
            order.setStatus(OrderStatus.CANCELLED);
            Order cancelledOrder = orderRepository.save(order);
            
            System.out.println("✅ Order cancelled successfully");
            return cancelledOrder;
            
        } catch (Exception e) {
            System.err.println("❌ Error cancelling order: " + e.getMessage());
            throw new RuntimeException("Failed to cancel order: " + e.getMessage(), e);
        }
    }

    // Get order statistics
    public OrderStatistics getOrderStatistics() {
        System.out.println("📊 Calculating order statistics");
        
        try {
            OrderStatistics stats = new OrderStatistics();
            
            stats.setTotalOrders(orderRepository.count());
            stats.setPendingOrders(orderRepository.countByStatus(OrderStatus.PENDING));
            stats.setConfirmedOrders(orderRepository.countByStatus(OrderStatus.CONFIRMED));
            stats.setCompletedOrders(orderRepository.countByStatus(OrderStatus.COMPLETED));
            stats.setCancelledOrders(orderRepository.countByStatus(OrderStatus.CANCELLED));
            stats.setTotalRevenue(orderRepository.getTotalRevenue());
            
            System.out.println("✅ Order statistics calculated successfully");
            return stats;
            
        } catch (Exception e) {
            System.err.println("❌ Error calculating order statistics: " + e.getMessage());
            throw new RuntimeException("Failed to calculate order statistics: " + e.getMessage(), e);
        }
    }

    // Get recent orders
    public List<Order> getRecentOrders() {
        System.out.println("📋 Fetching recent orders");
        return orderRepository.findTop10ByOrderByOrderDateDesc();
    }

    // Helper class for statistics
    public static class OrderStatistics {
        private long totalOrders;
        private long pendingOrders;
        private long confirmedOrders;
        private long completedOrders;
        private long cancelledOrders;
        private double totalRevenue;

        // Getters and Setters
        public long getTotalOrders() { return totalOrders; }
        public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

        public long getPendingOrders() { return pendingOrders; }
        public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }

        public long getConfirmedOrders() { return confirmedOrders; }
        public void setConfirmedOrders(long confirmedOrders) { this.confirmedOrders = confirmedOrders; }

        public long getCompletedOrders() { return completedOrders; }
        public void setCompletedOrders(long completedOrders) { this.completedOrders = completedOrders; }

        public long getCancelledOrders() { return cancelledOrders; }
        public void setCancelledOrders(long cancelledOrders) { this.cancelledOrders = cancelledOrders; }

        public double getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
    }
}