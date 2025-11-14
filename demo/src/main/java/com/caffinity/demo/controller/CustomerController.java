package com.caffinity.demo.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.caffinity.demo.entity.Customer;
import com.caffinity.demo.service.CustomerService;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:3000") // Allow React app to connect
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    // Test endpoint to check if backend is running
    @GetMapping("/test")
    public String test() {
        return "Backend is working! Time: " + new java.util.Date();
    }

    // Register a new customer
    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(@RequestBody Customer customer) {
        try {
            // Set email from username if not provided
            if (customer.getEmail() == null || customer.getEmail().isEmpty()) {
                customer.setEmail(customer.getUsername());
            }

            Customer savedCustomer = customerService.createCustomer(customer);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful");
            response.put("customerId", savedCustomer.getId());
            response.put("username", savedCustomer.getUsername());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Get all customers
    @GetMapping
    public ResponseEntity<?> getAllCustomers() {
        try {
            return ResponseEntity.ok(customerService.getAllCustomers());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving customers: " + e.getMessage());
        }
    }

    // Get customer by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable Long id) {
        try {
            Optional<Customer> customer = customerService.getCustomerById(id);
            if (customer.isPresent()) {
                return ResponseEntity.ok(customer.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Customer not found with id: " + id);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving customer: " + e.getMessage());
        }
    }

    // Check if username exists
    @GetMapping("/check-username/{username}")
    public ResponseEntity<?> checkUsernameExists(@PathVariable String username) {
        try {
            boolean exists = customerService.existsByUsername(username);
            Map<String, Boolean> response = new HashMap<>();
            response.put("exists", exists);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error checking username: " + e.getMessage());
        }
    }

    // Check if email exists
    @GetMapping("/check-email/{email}")
    public ResponseEntity<?> checkEmailExists(@PathVariable String email) {
        try {
            boolean exists = customerService.existsByEmail(email);
            Map<String, Boolean> response = new HashMap<>();
            response.put("exists", exists);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error checking email: " + e.getMessage());
        }
    }

    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<?> loginCustomer(@RequestBody Map<String, String> loginRequest) {
        try {
            String username = loginRequest.get("username");
            String password = loginRequest.get("password");

            // Validate input
            if (username == null || username.trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Username is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            if (password == null || password.trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Password is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            // Authenticate customer
            Customer authenticatedCustomer = customerService.authenticateCustomer(username, password);

            if (authenticatedCustomer != null) {
                // Create response without password
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("customer", createCustomerResponse(authenticatedCustomer));
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid username or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Helper method to create customer response without password
    private Map<String, Object> createCustomerResponse(Customer customer) {
        Map<String, Object> customerResponse = new HashMap<>();
        customerResponse.put("id", customer.getId());
        customerResponse.put("username", customer.getUsername());
        customerResponse.put("firstName", customer.getFirstName());
        customerResponse.put("lastName", customer.getLastName());
        customerResponse.put("email", customer.getEmail());
        customerResponse.put("phoneNumber", customer.getPhoneNumber());
        customerResponse.put("loginStatus", customer.getLoginStatus());
        return customerResponse;
    }

    // Logout endpoint
    @PostMapping("/logout/{id}")
    public ResponseEntity<?> logoutCustomer(@PathVariable Long id) {
        try {
            Customer loggedOutCustomer = customerService.logoutCustomer(id);
            if (loggedOutCustomer != null) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Logout successful");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Customer not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Logout failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Get customer by username (for testing)
    @GetMapping("/username/{username}")
    public ResponseEntity<?> getCustomerByUsername(@PathVariable String username) {
        try {
            Optional<Customer> customer = customerService.getCustomerByUsername(username);
            if (customer.isPresent()) {
                return ResponseEntity.ok(createCustomerResponse(customer.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Customer not found with username: " + username);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving customer: " + e.getMessage());
        }
    }
}