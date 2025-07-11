package com.example.core.employee;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "Employee")
@Data
@NoArgsConstructor
@AllArgsConstructor


public class Employee {


        @Id
        @Column(name = "CIN", unique = true, nullable = false)
        private String CIN;

        @Column(name = "full_name", nullable = false)
        private String fullName;

        @Column(name = "email", unique = true, nullable = false)
        private String email;

        @Column(name = "phone_number", nullable = false)
        private String phoneNumber;

        @Column(name = "address", nullable = false)
        private String address;

        @Column(name = "gender", nullable = false)
        private String gender;

        @Column(name = "hire_date", nullable = false)
        private LocalDate hireDate;

        @Column(name = "department", nullable = false)
        private String department;

        @Column(name = "occupation", nullable = false)
        private String occupation;

        @Column(name = "username", unique = true, nullable = false)
        private String username;

        @Column(name = "password", nullable = false)
        private String password;



    }



