package com.example.core.project;
import com.example.core.employee.Employee;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @Column(name = "nameProject", nullable = false)
    private String name;

    @Column(name="description" , columnDefinition = "TEXT")
    private String description;

    @Column(name = "startDate", nullable = false)
    private LocalDate startDate;

    @Column(name = "endDate")
    private LocalDate endDate;

    @Column(name = "status", nullable = false)
    private String status; // 'Planned', 'In Progress', etc.

    @Column(name = "budget")
    private Double budget;

    @Column(name = "clientName", nullable = false)
    private String clientName;

    @Column(name = "priority", nullable = false)
    private String priority; // 'Low', 'Medium', 'High', 'Critical'

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


    public String getProjectLeaderCin() {
        return projectLeader != null ? projectLeader.getCIN() : null;
    }
}
