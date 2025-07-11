package com.example.core.employee;

import java.util.List;
import java.util.Optional;

public interface EmployeeServices {

    Employee addEmployee(Employee employee);
    Employee updateEmployee(Employee employee);
    void deleteEmployee(String cin);
    Optional<Employee> getEmployeeByCIN(String cin);
    Optional<Employee> getEmployeeByUserName(String username);
    Optional<Employee> getEmployeeByPhoneNumber(String phoneNumber);
    List<Employee> getAllEmployees();

}
