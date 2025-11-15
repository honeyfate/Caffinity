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
        return userRepository.findById(id);
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
        User user = userRepository.findById(id)
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
        User user = userRepository.findById(id)
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
        Optional<User> userOpt = userRepository.findById(userId);
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
        Optional<User> userOpt = userRepository.findById(userId);
        return userOpt.isPresent() && userOpt.get().getRole() == UserRole.ADMIN;
    }
}