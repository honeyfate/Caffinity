// PaymentStatus.java
package com.caffinity.demo.entity;

public enum PaymentStatus {
    PENDING,        // Payment initiated
    PROCESSING,     // Payment being processed
    COMPLETED,      // Payment successful
    FAILED,         // Payment failed
    CANCELLED,      // Payment cancelled
    REFUNDED        // Payment refunded
}