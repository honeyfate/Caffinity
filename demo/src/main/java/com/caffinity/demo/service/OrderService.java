package com.caffinity.demo.service;
 
import java.util.Arrays;
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
import com.caffinity.demo.entity.PaymentMethod;
import com.caffinity.demo.entity.PaymentStatus;
import com.caffinity.demo.entity.User;
import com.caffinity.demo.repository.CartRepository;
import com.caffinity.demo.repository.OrderItemRepository;
import com.caffinity.demo.repository.OrderRepository;
import com.caffinity.demo.repository.ProductRepository;
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
 
    @Autowired
    private ProductRepository productRepository;
 
    // Create order from frontend with customer info and order items
    @Transactional
    public Order createOrderFromFrontend(Long userId, com.caffinity.demo.controller.OrderController.CreateOrderRequest request) {
        System.out.println("🔄 Creating order from frontend for user ID: " + userId);
       
        // DEBUG: Log what's coming from frontend
        System.out.println("🔍 DEBUG - Received CreateOrderRequest:");
        System.out.println("💰 paymentMethod: '" + request.getPaymentMethod() + "'");
        System.out.println("💰 paymentStatus: '" + request.getPaymentStatus() + "'");
        System.out.println("💰 totalAmount: " + request.getTotalAmount());
        System.out.println("📦 orderItems count: " + (request.getOrderItems() != null ? request.getOrderItems().size() : 0));
       
        try {
            // User is now required since we removed guest orders
            User user = userRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
           
            // Create new order
            Order order = new Order();
            order.setUser(user);
            order.setStatus(OrderStatus.PENDING);
            order.setTotalAmount(request.getTotalAmount());
           
            // ====== REMOVED CUSTOMER INFO HANDLING ======
            // Since we removed customerName and customerPhone fields from Order entity,
            // all customer info should come from the User entity
           
            System.out.println("✅ Order created for user: " + user.getUsername() + " (ID: " + userId + ")");
           
            // ====== PAYMENT HANDLING ======
            // Set payment method
            if (request.getPaymentMethod() != null && !request.getPaymentMethod().isEmpty()) {
                try {
                    String paymentMethodStr = request.getPaymentMethod().toUpperCase().replace(" ", "_");
                    PaymentMethod paymentMethod = PaymentMethod.valueOf(paymentMethodStr);
                    order.setPaymentMethod(paymentMethod);
                    System.out.println("✅ Payment method set to: " + paymentMethod);
                } catch (IllegalArgumentException e) {
                    System.err.println("⚠️ Invalid payment method: " + request.getPaymentMethod() +
                                     ". Valid values: " + Arrays.toString(PaymentMethod.values()));
                    System.err.println("⚠️ Defaulting to GCASH");
                    order.setPaymentMethod(PaymentMethod.GCASH);
                }
            } else {
                // Default payment method
                System.out.println("⚠️ No payment method provided, defaulting to GCASH");
                order.setPaymentMethod(PaymentMethod.GCASH);
            }
           
            // Set payment status
            if (request.getPaymentStatus() != null && !request.getPaymentStatus().isEmpty()) {
                try {
                    String paymentStatusStr = request.getPaymentStatus().toUpperCase();
                    PaymentStatus paymentStatus = PaymentStatus.valueOf(paymentStatusStr);
                    order.setPaymentStatus(paymentStatus);
                    System.out.println("✅ Payment status set to: " + paymentStatus);
                } catch (IllegalArgumentException e) {
                    System.err.println("⚠️ Invalid payment status: " + request.getPaymentStatus() +
                                     ". Defaulting to PENDING.");
                    order.setPaymentStatus(PaymentStatus.PENDING);
                }
            } else {
                order.setPaymentStatus(PaymentStatus.PENDING);
            }
           
            // Set payment amount (should match total amount)
            if (request.getTotalAmount() != null) {
                order.setPaymentAmount(request.getTotalAmount());
            }
           
            // Generate transaction ID if not provided
            if (request.getTransactionId() != null && !request.getTransactionId().isEmpty()) {
                order.setTransactionId(request.getTransactionId());
                System.out.println("✅ Using provided transaction ID: " + request.getTransactionId());
            } else {
                // Generate a unique transaction ID
                String transactionId = "TXN-" + System.currentTimeMillis() + "-" + userId;
                order.setTransactionId(transactionId);
                System.out.println("✅ Generated transaction ID: " + transactionId);
            }
            // ====== END PAYMENT HANDLING ======
           
            // Add order items from frontend
            if (request.getOrderItems() != null && !request.getOrderItems().isEmpty()) {
                for (com.caffinity.demo.controller.OrderController.OrderItemData itemData : request.getOrderItems()) {
                    OrderItem orderItem = new OrderItem();
                   
                    // Fetch the product by ID
                    orderItem.setProduct(productRepository.findByProductId(itemData.getProductId())
                            .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemData.getProductId())));
                   
                    orderItem.setQuantity(itemData.getQuantity());
                    orderItem.setUnitPrice(itemData.getPrice());
                    order.addOrderItem(orderItem);
                }
            }
           
            // Save order
            Order savedOrder = orderRepository.save(order);
            System.out.println("✅ Order created successfully with ID: " + savedOrder.getOrderId());
            System.out.println("💰 Final payment method in DB: " + savedOrder.getPaymentMethod());
            System.out.println("💰 Final transaction ID in DB: " + savedOrder.getTransactionId());
           
            // Clear user's cart after successful order creation
            Optional<Cart> userCart = cartRepository.findByUserWithItems(user);
            if (userCart.isPresent()) {
                cartRepository.delete(userCart.get());
                System.out.println("🛒 User cart cleared after order creation");
            }
           
            return savedOrder;
           
        } catch (Exception e) {
            System.err.println("❌ Error creating order from frontend: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create order: " + e.getMessage(), e);
        }
    }
 
    // Create order from cart - UPDATED with payment handling
    @Transactional
    public Order createOrderFromCart(Long userId) {
        System.out.println("🔄 Creating order from cart for user ID: " + userId);
       
        try {
            // Get user (now required)
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
           
            // ====== REMOVED CUSTOMER INFO HANDLING ======
            // Customer info now comes from User entity association
            System.out.println("✅ Order created for user: " + user.getUsername());
           
            // ====== PAYMENT HANDLING FOR CART ORDERS ======
            // Default payment method for cart orders
            order.setPaymentMethod(PaymentMethod.GCASH);
            order.setPaymentStatus(PaymentStatus.PENDING);
           
            // Calculate total first to get payment amount
            double totalAmount = 0.0;
            for (CartItem cartItem : cart.getCartItems()) {
                OrderItem orderItem = new OrderItem();
                orderItem.setProduct(cartItem.getProduct());
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setUnitPrice(cartItem.getPrice());
                order.addOrderItem(orderItem);
               
                // Calculate total
                totalAmount += (cartItem.getPrice() * cartItem.getQuantity());
            }
           
            order.setTotalAmount(totalAmount);
            order.setPaymentAmount(totalAmount);
           
            // Generate transaction ID
            String transactionId = "TXN-" + System.currentTimeMillis() + "-" + userId;
            order.setTransactionId(transactionId);
           
            System.out.println("✅ Payment method set to: " + order.getPaymentMethod());
            System.out.println("✅ Payment status set to: " + order.getPaymentStatus());
            System.out.println("✅ Generated transaction ID: " + transactionId);
            // ====== END PAYMENT HANDLING ======
           
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
        List<Order> orders = orderRepository.findAll();
        System.out.println("✅ Found " + orders.size() + " orders");
       
        // Debug: Check order info
        if (!orders.isEmpty()) {
            System.out.println("🔍 Sample order info:");
            orders.stream().limit(3).forEach(order -> {
                System.out.println("   Order ID: " + order.getOrderId() +
                                 ", User: " + (order.getUser() != null ? order.getUser().getUsername() : "null"));
            });
        }
       
        return orders;
    }
 
    // Get order by ID
    public Optional<Order> getOrderById(Long id) {
        System.out.println("🔍 Fetching order by ID: " + id);
        Optional<Order> order = orderRepository.findByOrderId(id);
        if (order.isPresent()) {
            System.out.println("✅ Order found - User: " +
                             (order.get().getUser() != null ? order.get().getUser().getUsername() : "null"));
        }
        return order;
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