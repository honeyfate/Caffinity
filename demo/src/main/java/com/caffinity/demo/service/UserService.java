package com.caffinity.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.caffinity.demo.entity.User;
import com.caffinity.demo.entity.UserRole;
import com.caffinity.demo.repository.UserRepository;

import jakarta.annotation.PostConstruct;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    public void initDefaultAdmin() {
        // Create default admin account if it doesn't exist
        String adminUsername = "admin@caffinity.com";
        if (!userRepository.existsByUsername(adminUsername)) {
            User adminUser = new User(
                adminUsername,
                "admin123", // Default password - in production, this should be encrypted
                "System",
                "Administrator",
                adminUsername,
                "+1234567890",
                UserRole.ADMIN
            );
            userRepository.save(adminUser);
            System.out.println("Default admin account created: " + adminUsername);
        }
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findByUserId(id);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User createUser(User user) {
        // Check if username already exists
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Set default role to CUSTOMER if not specified
        if (user.getRole() == null) {
            user.setRole(UserRole.CUSTOMER);
        }

        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findByUserId(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setEmail(userDetails.getEmail());
        user.setPhoneNumber(userDetails.getPhoneNumber());
        user.setLoginStatus(userDetails.getLoginStatus());
        user.setRole(userDetails.getRole());

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findByUserId(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        userRepository.delete(user);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    // Login authentication method
    public User authenticateUser(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // For now, comparing plain text passwords
            // In production, you should use password encoding
            if (user.getPassword().equals(password)) {
                // Update login status
                user.setLoginStatus("ONLINE");
                userRepository.save(user);
                return user;
            }
        }
        return null; // Authentication failed
    }

    // Logout method
    public User logoutUser(Long userId) {
        Optional<User> userOpt = userRepository.findByUserId(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setLoginStatus("OFFLINE");
            return userRepository.save(user);
        }
        return null;
    }

    // Get users by role
    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    // Check if user is admin
    public boolean isAdmin(Long userId) {
        Optional<User> userOpt = userRepository.findByUserId(userId);
        return userOpt.isPresent() && userOpt.get().getRole() == UserRole.ADMIN;
    }

    // Update user profile with all fields including profile picture
    public User updateUserProfile(Long id, String firstName, String lastName,
            String email, String username, String phoneNumber,
                String profilePicture) {
        Optional<User> userOpt = userRepository.findByUserId(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Update basic fields
            if (firstName != null && !firstName.trim().isEmpty()) {
                user.setFirstName(firstName);
            }
            if (lastName != null && !lastName.trim().isEmpty()) {
                user.setLastName(lastName);
            }
            if (email != null && !email.trim().isEmpty()) {
                // Check if email is already taken by another user
                Optional<User> existingUser = userRepository.findByEmail(email);
                if (existingUser.isPresent() && !existingUser.get().getUserId().equals(id)) {
                    throw new RuntimeException("Email already taken by another user");
                }
                user.setEmail(email);
            }
            if (username != null && !username.trim().isEmpty()) {
                // Check if username is already taken by another user
                Optional<User> existingUser = userRepository.findByUsername(username);
                if (existingUser.isPresent() && !existingUser.get().getUserId().equals(id)) {
                    throw new RuntimeException("Username already taken by another user");
                }
                user.setUsername(username);
            }
            if (phoneNumber != null) {
                user.setPhoneNumber(phoneNumber);
            }
            
            // Update profile picture
            if (profilePicture != null) {
                user.setProfilePicture(profilePicture);
            }
            
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found");
    }

    // Change user password
    public User changeUserPassword(Long id, String currentPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findByUserId(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Verify current password
            if (!user.getPassword().equals(currentPassword)) {
                throw new RuntimeException("Current password is incorrect");
            }
            user.setPassword(newPassword);
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found");
    }

    // Get admin profile
    public User getAdminProfile(Long id) {
        User admin = userRepository.findByUserId(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));
        
        // Optional: Add admin role validation
        if (admin.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("User is not an admin");
        }
        
        return admin;
    }

    public User updateUserProfilePicture(Long id, String profilePicture) {
        User user = userRepository.findByUserId(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        System.out.println("🖼️ Updating profile picture for user: " + user.getUsername());
        System.out.println("📸 New picture length: " + (profilePicture != null ? profilePicture.length() : "null"));
        
        user.setProfilePicture(profilePicture);
        
        User savedUser = userRepository.save(user);
        System.out.println("✅ Profile picture saved successfully");
        
        return savedUser;
    }

    // Get customer profile
    public User getCustomerProfile(Long id) {
        User customer = userRepository.findByUserId(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        
        // Optional: Add customer role validation if needed
        // if (customer.getRole() != UserRole.CUSTOMER) {
        //     throw new RuntimeException("User is not a customer");
        // }
        
        return customer;
    }
}