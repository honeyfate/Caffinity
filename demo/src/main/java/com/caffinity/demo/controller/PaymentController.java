// PaymentController.java
package com.caffinity.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.caffinity.demo.entity.Payment;
import com.caffinity.demo.entity.PaymentMethod;
import com.caffinity.demo.service.PaymentService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(
            @RequestParam Long orderId,
            @RequestParam PaymentMethod paymentMethod,
            @RequestParam Double amount) {
        try {
            Payment payment = paymentService.createPayment(orderId, paymentMethod, amount);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating payment: " + e.getMessage());
        }
    }

    @PutMapping("/{paymentId}/complete")
    public ResponseEntity<?> completePayment(
            @PathVariable Long paymentId,
            @RequestParam String transactionId) {
        try {
            Payment payment = paymentService.completePayment(paymentId, transactionId);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error completing payment: " + e.getMessage());
        }
    }

    @PutMapping("/{paymentId}/fail")
    public ResponseEntity<?> failPayment(@PathVariable Long paymentId) {
        try {
            Payment payment = paymentService.failPayment(paymentId);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error failing payment: " + e.getMessage());
        }
    }

    @PutMapping("/order/{orderId}/fail")
    public ResponseEntity<?> failPaymentByOrderId(@PathVariable Long orderId) {
        try {
            Payment payment = paymentService.failPaymentByOrderId(orderId);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error failing payment: " + e.getMessage());
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Payment> getPaymentByOrderId(@PathVariable Long orderId) {
        try {
            Optional<Payment> payment = paymentService.getPaymentByOrderId(orderId);
            return payment.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        try {
            List<Payment> payments = paymentService.getAllPayments();
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}