package com.example.infrastructure.persistence;


import com.example.core.employee.Employee;
import com.example.core.employee.EmployeeRepoPort;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
public class EmployeeJpaAdapter implements EmployeeRepoPort {

    private final EmployeeRepo employeeRepo;

    public EmployeeJpaAdapter(EmployeeRepo employeeRepo) {
        this.employeeRepo = employeeRepo;
    }

    @Override
    public Employee saveEmployee(Employee employee) {
        return employeeRepo.save(employee);
    }

    @Override
    public List<Employee> findAllEmployees() {
        return employeeRepo.findAll();
    }

    @Override
    public Optional<Employee> findEmployeeByCIN(String CIN) {
        return employeeRepo.findByCIN(CIN);
    }

    @Override
    public Optional<Employee> findEmployeeByUsername(String username) {
        return employeeRepo.findByUsername(username);
    }

    @Override
    public Optional<Employee> findEmployeeByPhoneNumber(String phoneNumber) {
        return employeeRepo.findByPhoneNumber(phoneNumber);
    }

    @Override
    public boolean existsByCIN(String CIN) {
        return employeeRepo.existsByCIN(CIN);
    }

    @Override
    public boolean existsByUsername(String username) {
        return employeeRepo.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return employeeRepo.existsByEmail(email);
    }

    @Override
    public void deleteEmployeeByCIN(String CIN) {
        employeeRepo.deleteByCIN(CIN);
    }

    @Override
    public Employee updateEmployee(Employee employee) {
        return employeeRepo.save(employee);
    }

}
