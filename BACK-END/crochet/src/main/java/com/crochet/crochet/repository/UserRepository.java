package com.crochet.crochet.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.crochet.crochet.entities.User;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
}
