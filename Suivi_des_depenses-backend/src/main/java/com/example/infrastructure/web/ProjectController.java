package com.example.infrastructure.web;

import com.example.core.client.Client;
import com.example.core.project.Project;
import com.example.core.project.ProjectServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
    public List<Project> getAllProjects() {
        return projectServices.getAllProjects();
    }

    @GetMapping("/getProjectById/{id}")
    public Optional<Project> getProjectById(@PathVariable Long id) {
        return projectServices.getProjectById(id);
    }

    @PostMapping("/createProject")
    public Project createProject(@RequestBody Project project) {
        return projectServices.createProject(project);
    }

    @PutMapping("/updateProject/{id}")
    public Project updateProject(@PathVariable Long id, @RequestBody Project project) {
        return projectServices.updateProject(id, project);
    }

    @GetMapping("/getProjectsByStatus/{status}")
    public List<Project> getProjectsByStatus(@PathVariable String status) {
        return projectServices.getProjectByStatus(status);
    }

    @GetMapping("/getProjectsByLeader/{leaderReference}")
    public List<Project> getProjectsByLeader(@PathVariable String leaderReference) {
        return projectServices.getProjectByProjectLeader_Reference(leaderReference);
    }

    @GetMapping("/getProjectsByClient")
    public List<Project> getProjectsByClientName(@RequestParam String name) {
        return projectServices.getProjectByClientNameContainingIgnoreCase(name);
    }

    @GetMapping("/getProjectsByClient/{clientId}")
    public ResponseEntity<List<Project>> getProjectsByClient(@PathVariable Long clientId) {
        Client client = new Client();
        client.setIdClient(clientId);
        List<Project> projects = projectServices.getProjectsByClient(client);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/getProjectsByReference/{reference}")
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
