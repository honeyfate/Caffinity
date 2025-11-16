package com.caffinity.demo.repository;

import com.caffinity.demo.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByType(String type);
    List<Product> findByCategory(String category);
    List<Product> findByTypeAndCategory(String type, String category);
}