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


        @Column(name = "reference", unique = true, nullable = false)
        private String reference;


        @Column(name = "full_name", nullable = false)
        private String fullName;


        @Column(name = "birth_date", nullable = false)
        private LocalDate birthDate;

        @Column(name = "email", unique = true, nullable = false)
        private String email;

        @Column(name = "phone_number", nullable = false , unique = true)
        private String phoneNumber;

        @Column(name = "address", nullable = false)
        private String address;

        @Enumerated(EnumType.STRING)
        @Column(name = "gender", nullable = false)
        private Gender  gender;

        @Column(name = "hire_date", nullable = false)
        private LocalDate hireDate;

        @Enumerated(EnumType.STRING)
        @Column(name = "department", nullable = false)
        private Department department;

        @Column(name = "occupation", nullable = false)
        private String occupation;


        @Enumerated(EnumType.STRING)
        @Column(name = "status", nullable = false)
        private EmployeeStatus status = EmployeeStatus.Actif;


        @Column(name = "exit_date")
        private LocalDate exitDate;


        @Column(name = "username", unique = true, nullable = false)
        private String username;

        @Column(name = "password", nullable = false)
        private String password;



        @PrePersist
        @PreUpdate
        private void validateExitDate() {
                if (this.status == EmployeeStatus.Inactif && this.exitDate == null) {
                        throw new IllegalStateException("Exit date is required when status is INACTIVE.");
                }
        }



    }



