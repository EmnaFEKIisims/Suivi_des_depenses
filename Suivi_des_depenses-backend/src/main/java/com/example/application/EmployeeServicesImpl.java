package com.example.application;

import com.example.core.employee.*;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class EmployeeServicesImpl implements EmployeeServices {

    private final EmployeeRepoPort employeeRepoPort;

    public EmployeeServicesImpl(EmployeeRepoPort employeeRepoPort) {
        this.employeeRepoPort = employeeRepoPort;
    }

    @Override
    public Employee addEmployee(Employee employee) {
        employee.setStatus(EmployeeStatus.Actif);
        employee.setExitDate(null);
        return employeeRepoPort.saveEmployee(employee);
    }

    @Override
    public Employee updateEmployee(Employee employee) {
        if (!employeeRepoPort.existsByCIN(employee.getCIN())) {
            throw new IllegalStateException("Employee with CIN " + employee.getCIN() + " not found");
        }

        if(employee.getStatus().equals("INACTIVE") && employee.getExitDate() == null){
            throw new IllegalArgumentException("Exit Date is required when status is INACTIVE");
        }
        return employeeRepoPort.updateEmployee(employee);
    }



    @Override
    public Optional<Employee> getEmployeeByCIN(String CIN) {
        return employeeRepoPort.findEmployeeByCIN(CIN);
    }

    @Override
    public Optional<Employee> getEmployeeByFullName(String fullName) {
        return employeeRepoPort.findEmployeeByFullName(fullName);
    }

    @Override
    public Optional<Employee> getEmployeeByPhoneNumber(String phoneNumber) {
        return employeeRepoPort.findEmployeeByPhoneNumber(phoneNumber);
    }

    @Override
    public List<Employee> getAllEmployees() {
        return employeeRepoPort.findAllEmployees();
    }




    @Override
    public String generateReference() {
        Optional<Employee> lastEmployee = employeeRepoPort.findTopByOrderByReferenceDesc();
        int nextNumber = 1001;
        if (lastEmployee.isPresent()) {
            String lastRef = lastEmployee.get().getReference();
            nextNumber = Integer.parseInt(lastRef.replace("Emp", "")) + 1;
        }
        return "Emp" + nextNumber;
    }

    @Override
    public List<Employee> getEmployeesByStatus(EmployeeStatus status) {
        return employeeRepoPort.findByStatus(status);
    }


    private static final Map<Department, List<String>> OCCUPATIONS_BY_DEPARTMENT = Map.of(
            Department.IT, List.of("FullStack Developer", "System Administrator", "IT Support Technician", "IT Project Manager", "Network Engineer", "Software Engineer"),
            Department.Maintenance, List.of("Maintenance Technician", "Maintenance Engineer", "Maintenance Manager", "Maintenance Planner", "Electrical Maintenance Agent"),
            Department.Commercial, List.of("Sales Manager", "Client Officer", "Sales Engineer", "Sales Representative", "Commercial Assistant"),
            Department.Accounting, List.of("Accountant", "Chief Accountant", "Management Controller", "Accounting Assistant", "Financial Auditor"),
            Department.HR, List.of("Recruitment Officer", "HR Manager", "Payroll Manager", "HR Assistant", "Internal Trainer"),
            Department.Production, List.of("Production Operator", "Team Leader", "Line Manager", "Production Engineer", "Production Planner"),
            Department.Building_Infrastructure, List.of("Site Manager", "Building Engineer", "Infrastructure Technician", "Facility Manager", "Works Coordinator")
    );


    @Override
    public List<Department> getAllDepartments() {
        return List.of(Department.values());
    }

    @Override
    public List<String> getOccupationsByDepartment(Department department) {
        return OCCUPATIONS_BY_DEPARTMENT.getOrDefault(department, List.of());
    }



    @Override
    public Optional<Employee> getTopEmployeeByReferenceDesc() {
        return employeeRepoPort.findTopByOrderByReferenceDesc();
    }

    @Override
    public Optional<Employee> getEmployeeByReference(String reference) {
        return employeeRepoPort.findByReference(reference);
    }


    @Override
    public List<Employee> getEmployeesByDepartment(Department department) {
        return employeeRepoPort.findEmployeesByDepartment(department);
    }


    @Override
    public Optional<Employee> findByEmail(String email) {
        return employeeRepoPort.findByEmail(email);
    }


}