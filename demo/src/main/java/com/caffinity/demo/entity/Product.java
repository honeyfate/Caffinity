package com.caffinity.demo.entity;
 
import jakarta.persistence.*;
 
@Entity
@Table(name = "product")
public class Product {
 
    @Id
    private String productID;
 
    private String productName;
 
    private String description;
 
    private double price;
 
    private String category;
 
    public Product() {}
 
    public Product(String productID, String productName, String description, double price, String category) {
        this.productID = productID;
        this.productName = productName;
        this.description = description;
        this.price = price;
        this.category = category;
    }
 
    public String getProductID() { return productID; }
    public void setProductID(String productID) { this.productID = productID; }
 
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
 
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
 
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
 
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
 