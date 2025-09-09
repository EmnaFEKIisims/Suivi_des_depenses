package com.example.core.project;

import com.example.core.employee.Employee;
import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.core.client.Client;
import java.time.LocalDate;
import java.util.*;
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

    @Column(name = "description", columnDefinition = "TEXT")
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
    private Set<Employee> teamMembers;

    @ManyToOne
    @JoinColumn(name = "project_leader_reference", referencedColumnName = "reference")
    @JsonIdentityInfo(
            generator = ObjectIdGenerators.PropertyGenerator.class,
            property = "reference"
    )
    @JsonIdentityReference(alwaysAsId = true)
    private Employee projectLeader;

    @JsonSetter("teamMembers")
    @JsonProperty("teamMembers")
    public void setTeamMembersFromReferences(List<String> references) {
        if (references != null && !references.isEmpty()) {
            // Only set teamMembers if references are provided
            this.teamMembers = references.stream()
                    .filter(ref -> ref != null && !ref.trim().isEmpty())
                    .map(ref -> {
                        Employee employee = new Employee();
                        employee.setReference(ref.trim());
                        return employee;
                    })
                    .collect(Collectors.toSet());
        } else {
            this.teamMembers = null; // Allow null to indicate "no update"
        }
    }

    @JsonSetter("projectLeader")  // Force Jackson to use this setter for deserialization of "projectLeader"
    @JsonProperty("projectLeader")  // Ensure the field is serialized/deserialized with this name
    public void setProjectLeaderFromReference(String reference) {
        if (reference != null) {
            Employee employee = new Employee();
            employee.setReference(reference);
            this.projectLeader = employee;
        } else {
            this.projectLeader = null;
        }
    }

    // Custom toString to avoid cyclic reference
    @Override
    public String toString() {
        return "Project{" +
                "idProject=" + idProject +
                ", reference='" + reference + '\'' +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", status=" + status +
                ", budget=" + budget +
                ", clientId=" + (client != null ? client.getIdClient() : null) + // Avoid client.toString()
                ", priority=" + priority +
                ", progress=" + progress +
                ", teamMembers=" + (teamMembers != null ? teamMembers.stream().map(Employee::getReference).collect(Collectors.toList()) : null) + // Only include references
                ", projectLeader=" + (projectLeader != null ? projectLeader.getReference() : null) + // Only include reference
                '}';
    }
}