package com.caffinity.demo.repository;

import com.caffinity.demo.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByType(String type);
    List<Product> findByCategory(String category);
    List<Product> findByTypeAndCategory(String type, String category);
    
    // CUSTOM METHODS FOR CUSTOM FIELD NAMES
    @Query("SELECT p FROM Product p WHERE p.productId = :productId")
    Optional<Product> findByProductId(@Param("productId") Long productId);
    
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Product p WHERE p.productId = :productId")
    boolean existsByProductId(@Param("productId") Long productId);
    
    // Find products by multiple product IDs
    @Query("SELECT p FROM Product p WHERE p.productId IN :productIds")
    List<Product> findByProductIds(@Param("productIds") List<Long> productIds);

    // Add this to ProductRepository.java:
    @Modifying
    @Query("DELETE FROM Product p WHERE p.productId = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}