package com.example.core.project;
import com.example.core.employee.Employee;
import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.core.client.Client;
import java.util.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

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
    @JoinColumn(name = "client_id")
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
            inverseJoinColumns = @JoinColumn(name = "employee_reference", referencedColumnName = "reference")
    )
    @JsonIdentityInfo(
            generator = ObjectIdGenerators.PropertyGenerator.class,
            property = "reference"
    )
    @JsonIdentityReference(alwaysAsId = true)
    private Set<Employee> teamMembers = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "project_leader_reference", referencedColumnName = "reference")
    @JsonIdentityInfo(
            generator = ObjectIdGenerators.PropertyGenerator.class,
            property = "reference"
    )
    private Employee projectLeader;


    @JsonProperty("team_members")
    public void setTeamMembersFromReferences(List<String> references) {
        if (references != null) {
            // This assumes you can inject EmployeeRepo or fetch employees via a static context
            // For simplicity, we'll assume you have access to employeeRepository here
            // In practice, you might need to handle this differently
            this.teamMembers = references.stream()
                    .map(ref -> {
                        // You need to inject or access employeeRepository here
                        // This is a placeholder; you'll need to adapt it
                        Employee employee = new Employee();
                        employee.setReference(ref);
                        return employee;
                    })
                    .collect(Collectors.toSet());
        } else {
            this.teamMembers = new HashSet<>();
        }
    }

    public Set<Employee> getTeamMembers() {
        return teamMembers;
    }

    public void setTeamMembers(Set<Employee> teamMembers) {
        this.teamMembers = teamMembers;
    }


}
