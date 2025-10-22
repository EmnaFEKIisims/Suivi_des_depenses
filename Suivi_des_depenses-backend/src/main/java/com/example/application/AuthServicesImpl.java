package com.example.application;

import com.example.core.auth.AuthResponse;
import com.example.core.auth.AuthServices;
import com.example.core.auth.LoginRequest;
import com.example.core.employee.Employee;
import com.example.core.employee.EmployeeRepoPort;
import com.example.security.JwtUtil;
import com.example.security.TotpMfaUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;


import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class AuthServicesImpl implements AuthServices {

    private static final Logger logger = Logger.getLogger(AuthServicesImpl.class.getName());
    private final EmployeeRepoPort employeeRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final TotpMfaUtil totpMfaUtil;

    public AuthServicesImpl(EmployeeRepoPort employeeRepository,
                            AuthenticationManager authenticationManager,
                            JwtUtil jwtUtil,
                            TotpMfaUtil totpMfaUtil) {
        this.employeeRepository = employeeRepository;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.totpMfaUtil = totpMfaUtil;
    }

    @Override
    public AuthResponse authenticate(LoginRequest request) {
        try {
            // Authenticate credentials
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            // Load employee for MFA and roles
            Employee employee = employeeRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            // Check MFA
            if (employee.getMfaEnabled()) {
                if (request.getTotpCode() == null || !totpMfaUtil.verifyCode(employee.getMfaSecret(), request.getTotpCode())) {
                    throw new RuntimeException("Invalid MFA code");
                }
            }
            // Create UserDetails
            UserDetails userDetails = new User(
                    employee.getEmail(),
                    employee.getPassword(),
                    employee.getRoles().stream()
                            .map(role -> new SimpleGrantedAuthority(role.name()))
                            .collect(Collectors.toList())
            );
            // Generate token
            String token = jwtUtil.generateToken(userDetails);
            return new AuthResponse(token);
        } catch (AuthenticationException e) {
            logger.severe("Authentication failed for email " + request.getEmail() + ": " + e.getMessage());
            throw e;
        }
    }
}