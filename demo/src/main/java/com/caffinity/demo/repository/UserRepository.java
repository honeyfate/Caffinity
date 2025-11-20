package com.caffinity.demo.repository;

import com.caffinity.demo.entity.User;
import com.caffinity.demo.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Remove: findById(Long id) - this causes the error!
    
    // Add custom methods:
    @Query("SELECT u FROM User u WHERE u.userId = :userId")
    Optional<User> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.userId = :userId")
    boolean existsByUserId(@Param("userId") Long userId);
    
    // Keep your existing custom methods:
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findByRole(UserRole role);
    Optional<User> findByUsernameAndRole(String username, UserRole role);
}