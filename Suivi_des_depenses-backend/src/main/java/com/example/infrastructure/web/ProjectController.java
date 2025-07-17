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
        return projectServices.getProjectByIdProject(id);
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


    @GetMapping("/getProjectsByLeader/{leaderCIN}")
    public List<Project> getProjectsByLeader(@PathVariable String leaderId) {
        return projectServices.getProjectByProjectLeader_CIN( leaderId);
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
        return projectServices.getProjectByReference(reference)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @GetMapping("/generate-reference")
    public ResponseEntity<String> generateReference() {
        String reference = projectServices.generateProjectReference();
        return ResponseEntity.ok(reference);
    }






}
