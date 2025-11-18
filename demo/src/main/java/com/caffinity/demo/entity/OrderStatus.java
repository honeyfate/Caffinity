package com.caffinity.demo.entity;

public enum OrderStatus {
    PENDING,           // Order placed but payment not started
    PAYMENT_PENDING,   // Payment initiated but not completed
    PAYMENT_FAILED,    // Payment failed
    CONFIRMED,         // Payment received, order confirmed
    PREPARING,         // Order being prepared
    READY,            // Order ready for pickup/delivery
    COMPLETED,        // Order delivered/picked up
    CANCELLED         // Order cancelled
}