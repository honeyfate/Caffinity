package com.caffinity.demo.service;

import com.caffinity.demo.entity.Customer;
import com.caffinity.demo.entity.User;
import com.caffinity.demo.repository.CustomerRepository;
import com.caffinity.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    public Customer saveCustomer(Customer customer) {
        // Ensure the customer is properly saved as a User first
        return customerRepository.save(customer);
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(int id) {
        return customerRepository.findById(id).orElse(null);
    }
}