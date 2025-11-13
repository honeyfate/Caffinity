package com.caffinity.demo.controller;

import com.caffinity.demo.entity.Customer;
import com.caffinity.demo.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:3000")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    // Add this test endpoint
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Backend is working!");
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(@RequestBody Customer customer) {
        try {
            System.out.println("Received registration request: " + customer.getUsername());
            customer.setLoginStatus("OFFLINE");
            Customer savedCustomer = customerService.saveCustomer(customer);
            System.out.println("Registration successful for: " + savedCustomer.getUsername());
            return ResponseEntity.ok(savedCustomer);
        } catch (Exception e) {
            System.err.println("Registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Registration failed: " + e.getMessage());
        }
    }
}