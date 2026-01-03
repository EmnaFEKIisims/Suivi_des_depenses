package com.example.infrastructure.web;

import com.example.core.client.Client;
import com.example.core.project.Project;
import com.example.core.project.ProjectServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:4200")
public class ProjectController {

    private final ProjectServices projectServices;

    @Autowired
    public ProjectController(ProjectServices projectServices) {
        this.projectServices = projectServices;
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public List<Project> getAllProjects() {
        return projectServices.getAllProjects();
    }

    @GetMapping("/getProjectById/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @projectServices.getProjectById(#id)?.projectLeader?.email ?: '') or @projectServices.getProjectById(#id)?.teamMembers?.![email]?.contains(authentication.principal.username) ?: false")
    public Optional<Project> getProjectById(@PathVariable Long id) {
        return projectServices.getProjectById(id);
    }

    @PostMapping("/createProject")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Project createProject(@RequestBody Project project) {
        return projectServices.createProject(project);
    }

    @PutMapping("/updateProject/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Project updateProject(@PathVariable Long id, @RequestBody Project project) {
        return projectServices.updateProject(id, project);
    }

    @GetMapping("/getProjectsByStatus/{status}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public List<Project> getProjectsByStatus(@PathVariable String status) {
        return projectServices.getProjectByStatus(status);
    }

    @GetMapping("/getProjectsByLeader/{leaderReference}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @employeeServices.findByReference(#leaderReference)?.email ?: '')")
    public List<Project> getProjectsByLeader(@PathVariable String leaderReference) {
        return projectServices.getProjectByProjectLeader_Reference(leaderReference);
    }

    @GetMapping("/getProjectsByClient")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public List<Project> getProjectsByClientName(@RequestParam String name) {
        return projectServices.getProjectByClientNameContainingIgnoreCase(name);
    }

    @GetMapping("/getProjectsByClient/{clientId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<Project>> getProjectsByClient(@PathVariable Long clientId) {
        Client client = new Client();
        client.setIdClient(clientId);
        List<Project> projects = projectServices.getProjectsByClient(client);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/getProjectsByReference/{reference}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @projectServices.getProjectByReference(#reference)?.projectLeader?.email ?: '') or @projectServices.getProjectByReference(#reference)?.teamMembers?.![email]?.contains(authentication.principal.username) ?: false")
    public ResponseEntity<Project> getProjectByReference(@PathVariable String reference) {
        Optional<Project> project = projectServices.getProjectByReference(reference);
        return project.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/generate-reference")
    public ResponseEntity<String> generateReference() {
        String reference = projectServices.generateProjectReference();
        return ResponseEntity.ok(reference);
    }






}
