package com.example.infrastructure.web;

import com.example.core.employee.Employee;
import com.example.core.employee.EmployeeServices;
import org.springframework.http.ResponseEntity;
import com.example.core.employee.Department;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:4200")
public class EmployeeController {

    private final EmployeeServices employeeServices;

    public EmployeeController(EmployeeServices employeeServices) {
        this.employeeServices = employeeServices;
    }

    @PostMapping("/createEmployee")
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee) {
        Employee savedEmployee = employeeServices.addEmployee(employee);
        return ResponseEntity.ok(savedEmployee);
    }

    @PutMapping("/updateEmployee/{CIN}")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable String CIN,
            @RequestBody Employee employee) {
        if (!CIN.equals(employee.getCIN())) {
            return ResponseEntity.badRequest().build();
        }
        Employee updatedEmployee = employeeServices.updateEmployee(employee);
        return ResponseEntity.ok(updatedEmployee);
    }


    @GetMapping("/getEmployeeByCIN/{CIN}")
    public ResponseEntity<Employee> getEmployeeByCIN(@PathVariable String CIN) {
        return employeeServices.getEmployeeByCIN(CIN)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/getEmployeeByUsername/{username}")
    public ResponseEntity<Employee> getEmployeeByUsername(@PathVariable String username) {
        return employeeServices.getEmployeeByUserName(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/getEmployeeByPhone/{phoneNumber}")
    public ResponseEntity<Employee> getEmployeeByPhoneNumber(@PathVariable String phoneNumber) {
        return employeeServices.getEmployeeByPhoneNumber(phoneNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        List<Employee> employees = employeeServices.getAllEmployees();
        return ResponseEntity.ok(employees);
    }


    @GetMapping("/getEmployeesByStatus/{status}")
    public List<Employee> getEmployeesByStatus(@PathVariable String status) {
        return employeeServices.getEmployeesByStatus(status);
    }


    @GetMapping("/getDepartments")
    public List<Department> getDepartments() {
        return employeeServices.getAllDepartments();
    }

    @GetMapping("/departments/{department}/occupations")
    public List<String> getOccupationsByDepartment(@PathVariable Department department) {
        return employeeServices.getOccupationsByDepartment(department);
    }






    @GetMapping("/getEmployeeByReference/{reference}")
    public ResponseEntity<Employee> getEmployeeByReference(@PathVariable String reference) {
        Optional<Employee> employeeOpt = employeeServices.getEmployeeByReference(reference);
        return employeeOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    @GetMapping("/getEmployeesByDepartment/{departmentName}")
    public ResponseEntity<List<Employee>> getEmployeesByDepartment(@PathVariable String departmentName) {
        Department department;
        try {
            department = Department.valueOf(departmentName.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        List<Employee> employees = employeeServices.getEmployeesByDepartment(department);
        return ResponseEntity.ok(employees);
    }



    @GetMapping("/generate-reference")
    public ResponseEntity<String> generateReference() {
        String reference = employeeServices.generateReference();
        return ResponseEntity.ok(reference);
    }


}