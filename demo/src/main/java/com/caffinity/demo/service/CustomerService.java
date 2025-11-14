package com.caffinity.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.caffinity.demo.entity.Customer;
import com.caffinity.demo.repository.CustomerRepository;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Optional<Customer> getCustomerById(Long id) {
        return customerRepository.findById(id);
    }

    public Optional<Customer> getCustomerByUsername(String username) {
        return customerRepository.findByUsername(username);
    }

    public Customer createCustomer(Customer customer) {
        // Check if username already exists
        if (customerRepository.existsByUsername(customer.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (customerRepository.existsByEmail(customer.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        return customerRepository.save(customer);
    }

    public Customer updateCustomer(Long id, Customer customerDetails) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));

        customer.setFirstName(customerDetails.getFirstName());
        customer.setLastName(customerDetails.getLastName());
        customer.setEmail(customerDetails.getEmail());
        customer.setPhoneNumber(customerDetails.getPhoneNumber());
        customer.setLoginStatus(customerDetails.getLoginStatus());

        return customerRepository.save(customer);
    }

    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        customerRepository.delete(customer);
    }

    public boolean existsByUsername(String username) {
        return customerRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return customerRepository.existsByEmail(email);
    }

    // Login authentication method
    public Customer authenticateCustomer(String username, String password) {
        Optional<Customer> customerOpt = customerRepository.findByUsername(username);
        
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            // For now, comparing plain text passwords
            // In production, you should use password encoding
            if (customer.getPassword().equals(password)) {
                // Update login status
                customer.setLoginStatus("ONLINE");
                customerRepository.save(customer);
                return customer;
            }
        }
        return null; // Authentication failed
    }

    // Logout method
    public Customer logoutCustomer(Long customerId) {
        Optional<Customer> customerOpt = customerRepository.findById(customerId);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            customer.setLoginStatus("OFFLINE");
            return customerRepository.save(customer);
        }
        return null;
    }
}