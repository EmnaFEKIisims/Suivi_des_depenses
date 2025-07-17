package com.example.core.project;
import com.example.core.employee.Employee;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.core.client.Client;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "Project")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idProject", unique = true, nullable = false)
    private Long idProject;


    @Column(name = "reference", unique = true, nullable = false)
    private String reference;


    @Column(name = "nameProject", nullable = false)
    private String name;

    @Column(name="description" , columnDefinition = "TEXT")
    private String description;

    @Column(name = "startDate", nullable = false)
    private LocalDate startDate;

    @Column(name = "endDate")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "budget")
    private Double budget;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private Priority priority;

    @Column(name = "progress", nullable = false)
    private Integer progress;


    @ManyToMany
    @JoinTable(
            name = "project_employee",
            joinColumns = @JoinColumn(name = "project_id", referencedColumnName = "idProject"),
            inverseJoinColumns = @JoinColumn(name = "employee_cin", referencedColumnName = "CIN")
    )
    private List<Employee> teamMembers;

    @ManyToOne
    @JoinColumn(name = "project_leader_cin", referencedColumnName = "CIN")
    private Employee projectLeader;



}
