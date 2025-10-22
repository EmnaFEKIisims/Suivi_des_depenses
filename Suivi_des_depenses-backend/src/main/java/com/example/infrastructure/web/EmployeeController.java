package com.example.infrastructure.web;

import com.example.core.employee.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:4200")
public class EmployeeController {

    private final EmployeeServices employeeServices;
    private final PasswordEncoder passwordEncoder;

    public EmployeeController(EmployeeServices employeeServices , PasswordEncoder passwordEncoder) {
        this.employeeServices = employeeServices;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/createEmployee")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee) {
        Employee savedEmployee = employeeServices.addEmployee(employee);
        return ResponseEntity.ok(savedEmployee);
    }

    @PutMapping("/updateEmployee/{CIN}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
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
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @employeeServices.findByCIN(#CIN)?.getEmail() ?: '')")    public ResponseEntity<Employee> getEmployeeByCIN(@PathVariable String CIN) {
        return employeeServices.getEmployeeByCIN(CIN)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/getEmployeeByUsername/{username}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @employeeServices.findByUsername(#username)?.getEmail() ?: '')")    public ResponseEntity<Employee> getEmployeeByFullName(@PathVariable String fullName) {
        return employeeServices.getEmployeeByFullName(fullName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/getEmployeeByPhone/{phoneNumber}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @employeeServices.findByPhoneNumber(#phoneNumber)?.getEmail() ?: '')")    public ResponseEntity<Employee> getEmployeeByPhoneNumber(@PathVariable String phoneNumber) {
        return employeeServices.getEmployeeByPhoneNumber(phoneNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        List<Employee> employees = employeeServices.getAllEmployees();
        return ResponseEntity.ok(employees);
    }


    @GetMapping("/getEmployeesByStatus/{status}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public List<Employee> getEmployeesByStatus(@PathVariable String status) {
        EmployeeStatus employeeStatus;
        try {
            employeeStatus = EmployeeStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status value: " + status);
        }
        return employeeServices.getEmployeesByStatus(employeeStatus);
    }



    @GetMapping("/getEmployeesByEmail")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (#email == authentication.principal.username)")
    public ResponseEntity<Employee> findByEmail(@RequestParam String email) {
        Optional<Employee> employee = employeeServices.findByEmail(email);
        return employee.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }



    @GetMapping("/getDepartments")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public List<Department> getDepartments() {
        return employeeServices.getAllDepartments();
    }

    @GetMapping("/departments/{department}/occupations")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public List<String> getOccupationsByDepartment(@PathVariable Department department) {
        return employeeServices.getOccupationsByDepartment(department);
    }






    @GetMapping("/getEmployeeByReference/{reference}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @employeeServices.findByReference(#reference)?.getEmail() ?: '')")
    public ResponseEntity<Employee> getEmployeeByReference(@PathVariable String reference) {
        Optional<Employee> employeeOpt = employeeServices.getEmployeeByReference(reference);
        return employeeOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    @GetMapping("/getEmployeesByDepartment/{departmentName}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<Employee>> getEmployeesByDepartment(@PathVariable String departmentName) {
        Department department;
        try {
            department = Arrays.stream(Department.values())
                    .filter(d -> d.name().equalsIgnoreCase(departmentName))
                    .findFirst()
                    .orElseThrow(IllegalArgumentException::new);
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


    @PostMapping("/{reference}/roles")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Employee> addRole(@PathVariable String reference, @RequestBody Role role) {
        Employee updated = employeeServices.addRole(reference, role);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/testPassword")
    public String testPassword(@RequestParam String rawPassword, @RequestParam String storedHash) {
        boolean matches = passwordEncoder.matches(rawPassword, storedHash);
        return "Password matches: " + matches;
    }


    @GetMapping("/hashPassword")
    public String hashPassword(@RequestParam String password) {
        return passwordEncoder.encode(password);
    }


}