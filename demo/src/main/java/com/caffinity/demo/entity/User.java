package com.caffinity.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;    

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(unique = true)
    private String email;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "login_status")
    private String loginStatus = "OFFLINE";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.CUSTOMER;

    // ✅ FIXED: Profile picture field declared only once in the correct place
    @Column(name = "profile_picture", columnDefinition = "LONGTEXT")
    private String profilePicture;

    // Default constructor
    public User() {}

    // Constructor with fields
    public User(String username, String password, String firstName, String lastName, 
                String email, String phoneNumber, UserRole role) {
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.role = role;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getLoginStatus() {
        return loginStatus;
    }

    public void setLoginStatus(String loginStatus) {
        this.loginStatus = loginStatus;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    // ✅ FIXED: Profile picture getter and setter in the right place
    public String getProfilePicture() {
        return profilePicture;
    }
    
    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    // Update profile method
    public void updateProfile(String firstName, String lastName, String email, 
                             String username, String phoneNumber, String profilePicture) {
        if (firstName != null && !firstName.trim().isEmpty()) {
            this.firstName = firstName;
        }
        if (lastName != null && !lastName.trim().isEmpty()) {
            this.lastName = lastName;
        }
        if (email != null && !email.trim().isEmpty()) {
            this.email = email;
        }
        if (username != null && !username.trim().isEmpty()) {
            this.username = username;
        }
        if (phoneNumber != null) {
            this.phoneNumber = phoneNumber;
        }
        if (profilePicture != null) {
            this.profilePicture = profilePicture;
        }
    }

    public void changePassword(String newPassword) {
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            this.password = newPassword;
        }
    }

    // Method to handle profile picture data
    public void setProfilePictureData(String profilePicture) {
        // Handle empty string as removal
        if (profilePicture != null && profilePicture.trim().isEmpty()) {
            this.profilePicture = null;
        } else {
            this.profilePicture = profilePicture;
        }
    }
}