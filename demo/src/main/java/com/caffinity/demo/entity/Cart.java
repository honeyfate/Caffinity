package com.caffinity.demo.entity;
 
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
 
@Entity
@Table(name = "cart")
public class Cart {
 
    @Id
    private String cartId;
 
    private String productId;
    private int quantity;
    private String dateAdded;
 
    public Cart() {}
 
    public Cart(String cartId, String productId, int quantity, String dateAdded) {
        this.cartId = cartId;
        this.productId = productId;
        this.quantity = quantity;
        this.dateAdded = dateAdded;
    }
 
    public String getCartId() {
        return cartId;
    }
 
    public void setCartId(String cartId) {
        this.cartId = cartId;
    }
 
    public String getProductId() {
        return productId;
    }
 
    public void setProductId(String productId) {
        this.productId = productId;
    }
 
    public int getQuantity() {
        return quantity;
    }
 
    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
 
    public String getDateAdded() {
        return dateAdded;
    }
 
    public void setDateAdded(String dateAdded) {
        this.dateAdded = dateAdded;
    }
}
 