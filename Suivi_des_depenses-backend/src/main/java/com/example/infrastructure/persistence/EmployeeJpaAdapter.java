package com.example.infrastructure.persistence;


import com.example.core.employee.Employee;
import com.example.core.employee.EmployeeRepoPort;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;
import com.example.core.employee.Department;
import java.util.Map;
import java.util.List;
import java.util.Arrays;
import java.util.stream.Collectors;

@Component
public class EmployeeJpaAdapter implements EmployeeRepoPort {

    private final EmployeeRepo employeeRepo;
    private static final Map<Department, List<String>> OCCUPATIONS_BY_DEPARTMENT = Map.of(
            Department.IT, List.of("FullStack Developer", "System Administrator", "Support Technician", "IT Project Manager", "Network Engineer", "Software Engineer"),
            Department.MAINTENANCE, List.of("Maintenance Technician", "Maintenance Engineer", "Maintenance Manager", "Maintenance Planner", "Electrical Maintenance Agent"),
            Department.COMMERCIAL, List.of("Sales Manager", "Client Representative", "Sales Engineer", "Sales Representative", "Sales Assistant"),
            Department.ACCOUNTING, List.of("Accountant", "Chief Accountant", "Management Controller", "Accounting Assistant", "Financial Auditor"),
            Department.HR, List.of("Recruitment Officer", "HR Manager", "Payroll Manager", "HR Assistant", "Internal Trainer"),
            Department.PRODUCTION, List.of("Production Operator", "Team Leader", "Line Manager", "Production Engineer", "Production Planner"),
            Department.BUILDING_INFRASTRUCTURE, List.of("Site Manager", "Construction Engineer", "Infrastructure Technician", "Installation Manager", "Works Coordinator")
    );

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
    public List<Employee> findEmployeesByDepartment(Department department) {
        return employeeRepo.findByDepartment(department);
    }



    @Override
    public Employee updateEmployee(Employee employee) {
        return employeeRepo.save(employee);
    }

    @Override
    public Optional<Employee> findTopByOrderByReferenceDesc() {
        return employeeRepo.findTopByOrderByReferenceDesc();
    }

    @Override
    public Optional<Employee> findByReference(String reference) {
        return employeeRepo.findByReference(reference);
    }

    @Override
    public List<Employee> findByStatus(String status) {
        return employeeRepo.findByStatus(status);
    }

    @Override
    public List<Department> getAllDepartments() {
        return Arrays.asList(Department.values());
    }

    @Override
    public List<String> getOccupationsByDepartment(Department department) {
        return OCCUPATIONS_BY_DEPARTMENT.getOrDefault(department, List.of());
    }

}
