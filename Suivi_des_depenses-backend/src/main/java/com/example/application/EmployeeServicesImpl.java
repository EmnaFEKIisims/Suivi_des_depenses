package com.example.application;

import com.example.core.employee.Employee;
import com.example.core.employee.EmployeeRepoPort;
import com.example.core.employee.EmployeeServices;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class EmployeeServicesImpl implements EmployeeServices {

    private final EmployeeRepoPort employeeRepoPort;

    public EmployeeServicesImpl(EmployeeRepoPort employeeRepoPort) {
        this.employeeRepoPort = employeeRepoPort;
    }

    @Override
    public Employee addEmployee(Employee employee) {
        if (employeeRepoPort.existsByCIN(employee.getCIN())) {
            throw new IllegalStateException("Employee with CIN " + employee.getCIN() + " already exists");
        }
        return employeeRepoPort.saveEmployee(employee);
    }

    @Override
    public Employee updateEmployee(Employee employee) {
        if (!employeeRepoPort.existsByCIN(employee.getCIN())) {
            throw new IllegalStateException("Employee with CIN " + employee.getCIN() + " not found");
        }
        return employeeRepoPort.updateEmployee(employee);
    }

    @Override
    public void deleteEmployee(String CIN) {
        employeeRepoPort.deleteEmployeeByCIN(CIN);
    }

    @Override
    public Optional<Employee> getEmployeeByCIN(String CIN) {
        return employeeRepoPort.findEmployeeByCIN(CIN);
    }

    @Override
    public Optional<Employee> getEmployeeByUserName(String username) {
        return employeeRepoPort.findEmployeeByUsername(username);
    }

    @Override
    public Optional<Employee> getEmployeeByPhoneNumber(String phoneNumber) {
        return employeeRepoPort.findEmployeeByPhoneNumber(phoneNumber);
    }

    @Override
    public List<Employee> getAllEmployees() {
        return employeeRepoPort.findAllEmployees();
    }
}