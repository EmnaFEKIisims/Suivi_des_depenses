package com.example.infrastructure.web;

import com.example.core.employee.Employee;
import com.example.core.employee.EmployeeServices;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
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

    @DeleteMapping("/deleteEmployee/{CIN}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable String CIN) {
        employeeServices.deleteEmployee(CIN);
        return ResponseEntity.noContent().build();
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
}