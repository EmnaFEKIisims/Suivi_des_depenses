package com.example.core.employee;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepoPort {


    Employee saveEmployee(Employee employee);
    List<Employee> findAllEmployees();
    Optional<Employee> findEmployeeByCIN(String CIN);
    Optional<Employee> findEmployeeByUsername(String username);
    Optional<Employee> findEmployeeByPhoneNumber(String phoneNumber);
    boolean existsByCIN(String CIN);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    void deleteEmployeeByCIN(String CIN);
    Employee updateEmployee(Employee employee);


}
