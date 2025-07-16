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
    Employee updateEmployee(Employee employee);
    Optional<Employee> findTopByOrderByReferenceDesc();
    Optional<Employee> findByReference(String reference);
    List<Employee> findByStatus(String status);
    public List<Department> getAllDepartments();
    public List<String> getOccupationsByDepartment(Department department);
    List<Employee> findEmployeesByDepartment(Department department);


}
