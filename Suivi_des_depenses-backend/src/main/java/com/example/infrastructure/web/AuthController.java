package com.example.infrastructure.web;


import com.example.core.auth.AuthResponse;
import com.example.core.auth.AuthServices;
import com.example.core.auth.LoginRequest;
import com.example.core.employee.Employee;
import com.example.core.employee.EmployeeRepoPort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.security.TotpMfaUtil;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthServices authService;
    private final EmployeeRepoPort employeeRepository;
    private final TotpMfaUtil totpMfaUtil;

    public AuthController(AuthServices authService, EmployeeRepoPort employeeRepository, TotpMfaUtil totpMfaUtil) {
        this.authService = authService;
        this.employeeRepository = employeeRepository;
        this.totpMfaUtil = totpMfaUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/setup-mfa")
    public ResponseEntity<byte[]> setupMfa(@RequestBody String email) throws Exception {
        Employee employee = employeeRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        String secret = totpMfaUtil.generateSecret();
        employee.setMfaSecret(secret);
        employee.setMfaEnabled(true);
        employeeRepository.saveEmployee(employee);
        return ResponseEntity.ok(totpMfaUtil.generateQrCode(secret, email));
    }

}

