package com.example.core.employee;

import java.util.List;
import java.util.Optional;

public interface EmployeeServices {

    Employee addEmployee(Employee employee);

    Employee updateEmployee(Employee employee);

    List<Employee> getAllEmployees();

    Optional<Employee> getEmployeeByCIN(String cin);

    Optional<Employee> getEmployeeByUserName(String username);

    Optional<Employee> getEmployeeByPhoneNumber(String phoneNumber);


    Optional<Employee> getTopEmployeeByReferenceDesc();

    Optional<Employee> getEmployeeByReference(String reference);

    List<Employee> getEmployeesByStatus(String status);

    List<Department> getAllDepartments();

    List<String> getOccupationsByDepartment(Department department);

    List<Employee> getEmployeesByDepartment(Department department);

    String generateReference();

}
