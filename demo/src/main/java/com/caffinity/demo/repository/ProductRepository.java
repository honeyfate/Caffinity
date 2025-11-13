package com.caffinity.demo.repository;

import com.caffinity.demo.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByProductNameContaining(String productName);
    List<Product> findByCategory(String category);
    List<Product> findByPriceBetween(double minPrice, double maxPrice);
}