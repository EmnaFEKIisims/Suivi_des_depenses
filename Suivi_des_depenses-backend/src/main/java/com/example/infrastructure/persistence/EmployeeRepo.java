package com.example.infrastructure.persistence;

import com.example.core.employee.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeRepo extends JpaRepository<Employee, Long> {
    Optional<Employee> findByCIN(String CIN);
    Optional<Employee> findByUsername(String username);
    Optional<Employee> findByPhoneNumber(String phoneNumber);
    boolean existsByCIN(String CIN);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    void deleteByCIN(String CIN);

}
