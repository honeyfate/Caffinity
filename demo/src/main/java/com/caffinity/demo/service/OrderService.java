package com.caffinity.demo.service;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.Iterator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.caffinity.demo.entity.Cart;
import com.caffinity.demo.entity.CartItem;
import com.caffinity.demo.entity.Order;
import com.caffinity.demo.entity.OrderItem;
import com.caffinity.demo.entity.OrderStatus;
import com.caffinity.demo.entity.PaymentMethod;
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
    public Order createOrderFromFrontend(Long userId, String sessionId, com.caffinity.demo.controller.OrderController.CreateOrderRequest request) {
        System.out.println("🔄 Creating order from frontend for user ID: " + userId + " and session ID: " + sessionId);
        System.out.println("💰 Payment Method from request: " + request.getPaymentMethod());
        System.out.println("💳 Transaction ID from request: " + request.getTransactionId());
        
        try {
            User user = null;
            if (userId != null) {
                user = userRepository.findByUserId(userId)
                        .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
            }

            // Create a map to track ordered product IDs and their total quantities
            Map<Long, Integer> orderedItemsQuantityMap = new HashMap<>();
            
            // Create new order
            Order order = new Order();
            if (user != null) {
                order.setUser(user);
            }
            order.setStatus(OrderStatus.PENDING);
            order.setTotalAmount(request.getTotalAmount());
            
            // FIX: Convert String to PaymentMethod enum using your specific enum values
            if (request.getPaymentMethod() != null && !request.getPaymentMethod().isEmpty()) {
                try {
                    // Normalize the string to match your enum values
                    String paymentMethodStr = request.getPaymentMethod().toUpperCase().trim();
                    
                    // Handle different input formats
                    if (paymentMethodStr.equals("CREDIT CARD") || paymentMethodStr.equals("CREDIT_CARD")) {
                        paymentMethodStr = "CREDIT_CARD";
                    } else if (paymentMethodStr.equals("DEBIT CARD") || paymentMethodStr.equals("DEBIT_CARD")) {
                        paymentMethodStr = "DEBIT_CARD";
                    } else if (paymentMethodStr.equals("BANK TRANSFER") || paymentMethodStr.equals("BANK_TRANSFER")) {
                        paymentMethodStr = "BANK_TRANSFER";
                    }
                    // GCASH and PAYMAYA are already single words
                    
                    // Convert to enum
                    PaymentMethod paymentMethod = PaymentMethod.valueOf(paymentMethodStr);
                    order.setPaymentMethod(paymentMethod);
                    System.out.println("✅ Converted payment method to enum: " + paymentMethod);
                } catch (IllegalArgumentException e) {
                    System.err.println("⚠️ Invalid payment method: " + request.getPaymentMethod() + 
                                 ". Using default: GCASH");
                    // Set default to GCASH (common in PH)
                    order.setPaymentMethod(PaymentMethod.GCASH);
                }
            } else {
                // Set default payment method if not provided (GCASH for PH)
                order.setPaymentMethod(PaymentMethod.GCASH);
                System.out.println("ℹ️ No payment method provided, using default: GCASH");
            }
            
            // Set transaction ID
            if (request.getTransactionId() != null && !request.getTransactionId().isEmpty()) {
                order.setTransactionId(request.getTransactionId());
            } else {
                // Generate transaction ID if not provided
                order.setTransactionId(generateTransactionId());
            }
            
            // Add order items from frontend and populate the map
            if (request.getOrderItems() != null && !request.getOrderItems().isEmpty()) {
                for (com.caffinity.demo.controller.OrderController.OrderItemData itemData : request.getOrderItems()) {
                    OrderItem orderItem = new OrderItem();
                    
                    // Fetch the product by ID
                    orderItem.setProduct(productRepository.findByProductId(itemData.getProductId())
                            .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemData.getProductId())));
                    
                    orderItem.setQuantity(itemData.getQuantity());
                    orderItem.setUnitPrice(itemData.getPrice());
                    order.addOrderItem(orderItem);

                    // Populate map for cart processing
                    orderedItemsQuantityMap.merge(itemData.getProductId(), itemData.getQuantity(), Integer::sum);
                }
            }
            
            // Save order
            Order savedOrder = orderRepository.save(order);
            System.out.println("✅ Order created successfully with ID: " + savedOrder.getOrderId());
            System.out.println("💰 Payment Method saved: " + savedOrder.getPaymentMethod());
            System.out.println("💳 Transaction ID saved: " + savedOrder.getTransactionId());
            
            // Only remove ordered items from cart
            Optional<Cart> userCartOpt = Optional.empty();

            // 1. Try to find the cart by User ID (for logged-in users)
            if (user != null) {
                userCartOpt = cartRepository.findByUserWithItems(user);
            } 
            
            // 2. If not found, try to find the cart by Session ID (for guest users)
            if (!userCartOpt.isPresent() && sessionId != null && !sessionId.isEmpty()) {
                userCartOpt = cartRepository.findBySessionIdWithItems(sessionId);
            }

            if (userCartOpt.isPresent()) {
                Cart userCart = userCartOpt.get();
                int itemsModifiedCount = 0;
                
                // Use Iterator for safe modification/removal while iterating
                Iterator<CartItem> iterator = userCart.getCartItems().iterator();
                while (iterator.hasNext()) {
                    CartItem cartItem = iterator.next();
                    Long productId = cartItem.getProduct().getProductId();
                    
                    if (orderedItemsQuantityMap.containsKey(productId)) {
                        Integer orderedQuantity = orderedItemsQuantityMap.get(productId);
                        
                        if (cartItem.getQuantity() <= orderedQuantity) {
                            // Remove the item completely from the cart's collection
                            iterator.remove();
                            itemsModifiedCount++;
                            System.out.println("🛒 Removed CartItem for Product ID: " + productId + " as quantity was fully ordered.");
                        } else {
                            // Decrement quantity
                            cartItem.setQuantity(cartItem.getQuantity() - orderedQuantity);
                            System.out.println("🛒 Decremented CartItem quantity for Product ID: " + productId + " to " + cartItem.getQuantity());
                            itemsModifiedCount++;
                        }
                        
                        // Remove the entry from the map after processing the corresponding cart item
                        orderedItemsQuantityMap.remove(productId);
                    }
                }
                
                if (itemsModifiedCount > 0) {
                    // The cart contents list was modified (items removed/quantities decremented)
                    cartRepository.save(userCart); 
                    System.out.println("🛒 Cart saved after removal/adjustment of items.");
                }
                
                // Check if the cart is now empty and delete the cart entity itself
                if (userCart.getCartItems().isEmpty()) {
                    cartRepository.delete(userCart);
                    System.out.println("🛒 User cart is now empty and has been removed.");
                }
            }
            
            return savedOrder;
            
        } catch (Exception e) {
            System.err.println("❌ Error creating order from frontend: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create order: " + e.getMessage(), e);
        }
    }

    // Create order from cart
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
            
            // FIX: Use PaymentMethod enum (GCASH as default)
            order.setPaymentMethod(PaymentMethod.GCASH);
            order.setTransactionId(generateTransactionId()); // Generate a transaction ID
            
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
            System.out.println("💰 Payment Method: " + savedOrder.getPaymentMethod());
            System.out.println("💳 Transaction ID: " + savedOrder.getTransactionId());
            
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

    // Helper method to generate unique transaction ID
    private String generateTransactionId() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = String.valueOf((int)(Math.random() * 10000));
        return "TXN-" + timestamp + "-" + random;
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