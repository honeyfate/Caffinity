package com.caffinity.demo.entity;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("CUSTOMER")
public class Customer extends User {

    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;

    public Customer() {}

    public Customer(String username, String password, String loginStatus, String firstName, String lastName) {
        super(username, password, loginStatus);
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
}
