package com.example.core.employee;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepoPort {


    Employee saveEmployee(Employee employee);
    List<Employee> findAllEmployees();
    Optional<Employee> findEmployeeByCIN(String CIN);
    Optional<Employee> findEmployeeByFullName(String fullName);
    Optional<Employee> findEmployeeByPhoneNumber(String phoneNumber);
    boolean existsByCIN(String CIN);
    boolean existsByFullName(String fullName);
    Employee updateEmployee(Employee employee);
    Optional<Employee> findTopByOrderByReferenceDesc();
    Optional<Employee> findByReference(String reference);
    List<Employee> findByStatus(EmployeeStatus status);
    public List<Department> getAllDepartments();
    public List<String> getOccupationsByDepartment(Department department);
    List<Employee> findEmployeesByDepartment(Department department);
    Optional<Employee> findByEmail(String email);


}
