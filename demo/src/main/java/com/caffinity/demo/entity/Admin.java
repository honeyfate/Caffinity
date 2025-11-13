package com.caffinity.demo.entity;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("ADMIN")
public class Admin extends User {

    private String adminName;

    public Admin() {}

    public Admin(String username, String password, String loginStatus, String adminName) {
        super(username, password, loginStatus);
        this.adminName = adminName;
    }

    public String getAdminName() { return adminName; }
    public void setAdminName(String adminName) { this.adminName = adminName; }
}
