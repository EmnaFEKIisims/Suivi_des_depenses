package com.example.infrastructure.persistence.employee;

import com.example.core.employee.Department;
import com.example.core.employee.Employee;
import com.example.core.employee.EmployeeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepo extends JpaRepository<Employee, Long> {
    Optional<Employee> findByCIN(String CIN);
    Optional<Employee> findByFullName(String fullName);
    Optional<Employee> findByPhoneNumber(String phoneNumber);
    boolean existsByCIN(String CIN);
    boolean existsByFullName(String fullName);
    boolean existsByEmail(String email);
    Optional<Employee> findByReference(String reference);
    Optional<Employee> findTopByOrderByReferenceDesc();
    List<Employee> findByStatus(EmployeeStatus status);
    List<Employee> findByDepartment(Department department);
    Optional<Employee> findByEmail(String email);


}
