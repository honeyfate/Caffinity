package com.caffinity.demo.repository;

import com.caffinity.demo.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    Optional<Customer> findByUsername(String username);
    List<Customer> findByFirstNameContainingOrLastNameContaining(String firstName, String lastName);
}