package com.caffinity.demo.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.caffinity.demo.entity.User;
import com.caffinity.demo.entity.UserRole;
import com.caffinity.demo.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    // Test endpoint to check if backend is running
    @GetMapping("/test")
    public String test() {
        return "Backend is working! Time: " + new java.util.Date();
    }

    // Register a new user
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            // Set email from username if not provided
            if (user.getEmail() == null || user.getEmail().isEmpty()) {
                user.setEmail(user.getUsername());
            }

            // Force role to be CUSTOMER for registration (admin accounts should be created differently)
            user.setRole(UserRole.CUSTOMER);

            User savedUser = userService.createUser(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful");
            response.put("userId", savedUser.getUserId());
            response.put("username", savedUser.getUsername());
            response.put("role", savedUser.getRole());
            response.put("note", "Password has been securely hashed");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Get all users
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(userService.getAllUsers());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving users: " + e.getMessage());
        }
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            Optional<User> user = userService.getUserById(id);
            if (user.isPresent()) {
                return ResponseEntity.ok(createUserResponse(user.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found with id: " + id);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving user: " + e.getMessage());
        }
    }

    // Check if username exists
    @GetMapping("/check-username/{username}")
    public ResponseEntity<?> checkUsernameExists(@PathVariable String username) {
        try {
            boolean exists = userService.existsByUsername(username);
            Map<String, Boolean> response = new HashMap<>();
            response.put("exists", exists);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error checking username: " + e.getMessage());
        }
    }

    // Check if email exists
    @GetMapping("/check-email/{email}")
    public ResponseEntity<?> checkEmailExists(@PathVariable String email) {
        try {
            boolean exists = userService.existsByEmail(email);
            Map<String, Boolean> response = new HashMap<>();
            response.put("exists", exists);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error checking email: " + e.getMessage());
        }
    }

    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        try {
            String username = loginRequest.get("username");
            String password = loginRequest.get("password");

            // Validate input
            if (username == null || username.trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Username is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            if (password == null || password.trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Password is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            // Authenticate user
            User authenticatedUser = userService.authenticateUser(username, password);

            if (authenticatedUser != null) {
                // Create response without password
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("user", createUserResponse(authenticatedUser));
                response.put("note", "Password verification successful using secure hashing");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid username or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Helper method to create user response without password
    private Map<String, Object> createUserResponse(User user) {
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("userId", user.getUserId());
        userResponse.put("username", user.getUsername());
        userResponse.put("firstName", user.getFirstName());
        userResponse.put("lastName", user.getLastName());
        userResponse.put("email", user.getEmail());
        userResponse.put("phoneNumber", user.getPhoneNumber());
        userResponse.put("loginStatus", user.getLoginStatus());
        userResponse.put("role", user.getRole().toString());
        userResponse.put("profilePicture", user.getProfilePicture());
        // Note: Password is intentionally excluded for security
        return userResponse;
    }

    // Logout endpoint
    @PostMapping("/logout/{id}")
    public ResponseEntity<?> logoutUser(@PathVariable Long id) {
        try {
            User loggedOutUser = userService.logoutUser(id);
            if (loggedOutUser != null) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Logout successful");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Logout failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Get user by username
    @GetMapping("/username/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        try {
            Optional<User> user = userService.getUserByUsername(username);
            if (user.isPresent()) {
                return ResponseEntity.ok(createUserResponse(user.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found with username: " + username);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving user: " + e.getMessage());
        }
    }

    // Get users by role
    @GetMapping("/role/{role}")
    public ResponseEntity<?> getUsersByRole(@PathVariable String role) {
        try {
            UserRole userRole = UserRole.valueOf(role.toUpperCase());
            return ResponseEntity.ok(userService.getUsersByRole(userRole));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid role: " + role);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving users: " + e.getMessage());
        }
    }

    // Get admin profile - UPDATED WITH DEBUG LOGGING
    @GetMapping("/admin/profile/{id}")
    public ResponseEntity<?> getAdminProfile(@PathVariable Long id) {
        try {
            System.out.println("🔍 Fetching admin profile for ID: " + id);
            User admin = userService.getAdminProfile(id);
            
            // Debug logging
            System.out.println("✅ Admin found: " + admin.getFirstName() + " " + admin.getLastName());
            System.out.println("📸 Profile picture in database: " + 
                (admin.getProfilePicture() != null ? 
                 admin.getProfilePicture().length() + " characters" : "null"));
            
            Map<String, Object> response = createUserResponse(admin);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.err.println("❌ Error fetching admin profile: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            System.err.println("❌ Unexpected error fetching admin profile: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error retrieving admin profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Update admin profile - UPDATED WITH PROFILE PICTURE HANDLING
    @PutMapping("/admin/profile/{id}")
    public ResponseEntity<?> updateAdminProfile(
        @PathVariable Long id,
        @RequestBody Map<String, Object> profileUpdate) {
        
        try {
            System.out.println("🔄 Updating admin profile for ID: " + id);
            
            // Extract fields with null safety
            String firstName = (String) profileUpdate.get("firstName");
            String lastName = (String) profileUpdate.get("lastName");
            String email = (String) profileUpdate.get("email");
            String username = (String) profileUpdate.get("username");
            String phoneNumber = (String) profileUpdate.get("phoneNumber");
            String profilePicture = (String) profileUpdate.get("profilePicture");

            // Debug logging for profile picture
            System.out.println("📸 Received profile picture data: " + 
                (profilePicture != null ? profilePicture.length() + " characters" : "null"));
            
            if (profilePicture != null && profilePicture.length() > 100) {
                System.out.println("📸 Profile picture preview: " + profilePicture.substring(0, 50) + "...");
            }

            User updatedAdmin = userService.updateUserProfile(id, firstName, lastName, email, username, phoneNumber, profilePicture);
            
            System.out.println("✅ Profile updated successfully");
            System.out.println("📸 Saved profile picture length: " + 
                (updatedAdmin.getProfilePicture() != null ? 
                 updatedAdmin.getProfilePicture().length() + " characters" : "null"));
            
            return ResponseEntity.ok(createUserResponse(updatedAdmin));
            
        } catch (RuntimeException e) {
            System.err.println("❌ Error updating admin profile: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            System.err.println("❌ Unexpected error updating admin profile: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error updating profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Change password
    @PutMapping("/admin/change-password/{id}")
    public ResponseEntity<?> changeAdminPassword(
        @PathVariable Long id,
        @RequestBody Map<String, String> passwordUpdate) {
        
        try {
            String currentPassword = passwordUpdate.get("currentPassword");
            String newPassword = passwordUpdate.get("newPassword");

            if (currentPassword == null || newPassword == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Current password and new password are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            User updatedAdmin = userService.changeUserPassword(id, currentPassword, newPassword);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Password updated successfully");
            response.put("user", createUserResponse(updatedAdmin));
            response.put("note", "New password has been securely hashed");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error changing password: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // NEW ENDPOINT: Update only profile picture
    @PutMapping("/admin/profile/{id}/picture")
    public ResponseEntity<?> updateAdminProfilePicture(
        @PathVariable Long id,
        @RequestBody Map<String, String> pictureUpdate) {
        
        try {
            System.out.println("🖼️ Updating profile picture for admin ID: " + id);
            
            String profilePicture = pictureUpdate.get("profilePicture");
            
            System.out.println("📸 Received profile picture length: " + 
                (profilePicture != null ? profilePicture.length() + " characters" : "null"));

            User updatedAdmin = userService.updateUserProfilePicture(id, profilePicture);
            
            System.out.println("✅ Profile picture updated successfully");
            System.out.println("📸 New profile picture length: " + 
                (updatedAdmin.getProfilePicture() != null ? 
                 updatedAdmin.getProfilePicture().length() + " characters" : "null"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile picture updated successfully");
            response.put("user", createUserResponse(updatedAdmin));
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.err.println("❌ Error updating profile picture: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            System.err.println("❌ Unexpected error updating profile picture: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error updating profile picture: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Get customer profile
    @GetMapping("/customer/profile/{id}")
    public ResponseEntity<?> getCustomerProfile(@PathVariable Long id) {
        try {
            System.out.println("🔍 Fetching customer profile for ID: " + id);
            User customer = userService.getCustomerProfile(id);
            
            // Debug logging
            System.out.println("✅ Customer found: " + customer.getFirstName() + " " + customer.getLastName());
            
            Map<String, Object> response = createUserResponse(customer);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.err.println("❌ Error fetching customer profile: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            System.err.println("❌ Unexpected error fetching customer profile: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error retrieving customer profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Update customer profile
    @PutMapping("/customer/profile/{id}")
    public ResponseEntity<?> updateCustomerProfile(
        @PathVariable Long id,
        @RequestBody Map<String, Object> profileUpdate) {
        
        try {
            System.out.println("🔄 Updating customer profile for ID: " + id);
            
            // Extract fields with null safety
            String firstName = (String) profileUpdate.get("firstName");
            String lastName = (String) profileUpdate.get("lastName");
            String email = (String) profileUpdate.get("email");
            String username = (String) profileUpdate.get("username");
            String phoneNumber = (String) profileUpdate.get("phoneNumber");
            String profilePicture = (String) profileUpdate.get("profilePicture");

            // Debug logging
            System.out.println("📧 Updating email to: " + email);
            System.out.println("📞 Updating phone to: " + phoneNumber);
            
            User updatedCustomer = userService.updateUserProfile(id, firstName, lastName, email, username, phoneNumber, profilePicture);
            
            System.out.println("✅ Customer profile updated successfully");
            
            return ResponseEntity.ok(createUserResponse(updatedCustomer));
            
        } catch (RuntimeException e) {
            System.err.println("❌ Error updating customer profile: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            System.err.println("❌ Unexpected error updating customer profile: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error updating profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Update customer profile picture only
    @PutMapping("/customer/profile/{id}/picture")
    public ResponseEntity<?> updateCustomerProfilePicture(
        @PathVariable Long id,
        @RequestBody Map<String, String> pictureUpdate) {
        
        try {
            System.out.println("🖼️ Updating profile picture for customer ID: " + id);
            
            String profilePicture = pictureUpdate.get("profilePicture");
            
            System.out.println("📸 Received profile picture length: " + 
                (profilePicture != null ? profilePicture.length() + " characters" : "null"));

            User updatedCustomer = userService.updateUserProfilePicture(id, profilePicture);
            
            System.out.println("✅ Profile picture updated successfully");
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile picture updated successfully");
            response.put("user", createUserResponse(updatedCustomer));
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.err.println("❌ Error updating profile picture: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            System.err.println("❌ Unexpected error updating profile picture: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error updating profile picture: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Change customer password
    @PutMapping("/customer/change-password/{id}")
    public ResponseEntity<?> changeCustomerPassword(
        @PathVariable Long id,
        @RequestBody Map<String, String> passwordUpdate) {
        
        try {
            String currentPassword = passwordUpdate.get("currentPassword");
            String newPassword = passwordUpdate.get("newPassword");

            if (currentPassword == null || newPassword == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Current password and new password are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            User updatedCustomer = userService.changeUserPassword(id, currentPassword, newPassword);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Password updated successfully");
            response.put("user", createUserResponse(updatedCustomer));
            response.put("note", "New password has been securely hashed");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error changing password: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ==================== PASSWORD HASHING SUPPORT ENDPOINTS ====================
    
    // Test endpoint to verify password hashing
    @GetMapping("/hash-test/{password}")
    public ResponseEntity<?> testHash(@PathVariable String password) {
        try {
            PasswordEncoder encoder = new BCryptPasswordEncoder();
            String hashed = encoder.encode(password);
            
            Map<String, Object> response = new HashMap<>();
            response.put("original", password);
            response.put("hashed", hashed);
            response.put("matches", encoder.matches(password, hashed));
            response.put("hashLength", hashed.length());
            response.put("isBcryptHash", hashed.startsWith("$2a$"));
            response.put("hashPrefix", hashed.substring(0, Math.min(10, hashed.length())));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Hashing test failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Generate hash for admin password (for manual database update)
    @GetMapping("/admin/hash-password/{password}")
    public ResponseEntity<?> hashPasswordForAdmin(@PathVariable String password) {
        try {
            PasswordEncoder encoder = new BCryptPasswordEncoder();
            String hashed = encoder.encode(password);
            
            Map<String, Object> response = new HashMap<>();
            response.put("original", password);
            response.put("hashed", hashed);
            response.put("sqlCommand", 
                "UPDATE users SET password = '" + hashed + "' WHERE username = 'admin@caffinity.com';");
            response.put("verification", encoder.matches(password, hashed));
            response.put("note", "Use this SQL command in MySQL Workbench to update admin password");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Password hashing failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Check if a user's password is hashed
    @GetMapping("/check-password-hash/{username}")
    public ResponseEntity<?> checkPasswordHash(@PathVariable String username) {
        try {
            Optional<User> userOpt = userService.getUserByUsername(username);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String password = user.getPassword();
                
                Map<String, Object> response = new HashMap<>();
                response.put("username", username);
                response.put("passwordStored", password != null ? password.substring(0, Math.min(20, password.length())) + "..." : "null");
                response.put("isHashed", password != null && (password.startsWith("$2a$") || password.startsWith("$2b$")));
                response.put("hashLength", password != null ? password.length() : 0);
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not found: " + username);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Check failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Test password verification
    @PostMapping("/test-password-verify")
    public ResponseEntity<?> testPasswordVerification(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            
            if (username == null || password == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Username and password are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            Optional<User> userOpt = userService.getUserByUsername(username);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                PasswordEncoder encoder = new BCryptPasswordEncoder();
                boolean matches = encoder.matches(password, user.getPassword());
                
                Map<String, Object> response = new HashMap<>();
                response.put("username", username);
                response.put("passwordProvided", password);
                response.put("passwordMatches", matches);
                response.put("userExists", true);
                response.put("userRole", user.getRole().toString());
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("username", username);
                response.put("passwordProvided", password);
                response.put("passwordMatches", false);
                response.put("userExists", false);
                response.put("note", "User does not exist");
                
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Verification test failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Reset user password (admin only feature - for testing)
    @PostMapping("/admin/reset-password/{username}")
    public ResponseEntity<?> resetUserPassword(
            @PathVariable String username,
            @RequestBody Map<String, String> request) {
        try {
            String newPassword = request.get("newPassword");
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "New password is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            Optional<User> userOpt = userService.getUserByUsername(username);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                PasswordEncoder encoder = new BCryptPasswordEncoder();
                String hashedPassword = encoder.encode(newPassword);
                
                // Save the hashed password
                user.setPassword(hashedPassword);
                // Note: In a real scenario, you'd need to inject UserRepository here
                // or create a method in UserService to update password directly
                
                Map<String, Object> response = new HashMap<>();
                response.put("username", username);
                response.put("newPasswordHashed", hashedPassword);
                response.put("verification", encoder.matches(newPassword, hashedPassword));
                response.put("note", "Password reset successful - use the service layer to actually save this");
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not found: " + username);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Password reset failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}