package com.caffinity.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 500)
    private String description;
    
    @Column(nullable = false)
    private Double price;
    
    @Column(nullable = false)
    private String type; // "coffee" or "dessert"
    
    private String category; // "Hot Coffee", "Iced Coffee", "Pastry", etc.
    
    private String imageUrl;
    
    // Constructors
    public Product() {}
    
    public Product(String name, String description, Double price, String type, String category, String imageUrl) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.type = type;
        this.category = category;
        this.imageUrl = imageUrl;
    }
    
    // Getters and Setters
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}