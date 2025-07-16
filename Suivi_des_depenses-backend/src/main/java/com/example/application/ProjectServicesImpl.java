package com.example.application;

import com.example.core.project.Project;
import com.example.core.project.ProjectRepoPort;
import com.example.core.project.ProjectServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProjectServicesImpl implements ProjectServices {

    private final ProjectRepoPort projectRepoPort;

    @Autowired
    public ProjectServicesImpl(ProjectRepoPort projectRepoPort) {
        this.projectRepoPort = projectRepoPort;
    }

    @Override
    public List<Project> getAllProjects() {
        return projectRepoPort.getAllProjects();
    }

    @Override
    public Project createProject(Project project) {
        try {
            // Create new project instance and copy basic fields
            Project newProject = new Project();
            newProject.setName(project.getName());
            newProject.setDescription(project.getDescription());
            newProject.setStartDate(project.getStartDate());
            newProject.setEndDate(project.getEndDate());
            newProject.setStatus(project.getStatus());
            newProject.setBudget(project.getBudget());
            newProject.setClientName(project.getClientName());
            newProject.setPriority(project.getPriority());
            newProject.setProgress(project.getProgress());

            // First save without relationships
            Project savedProject = projectRepoPort.createProject(newProject);

            // Then set relationships if they exist
            if (project.getProjectLeader() != null) {
                savedProject.setProjectLeader(project.getProjectLeader());
            }

            if (project.getTeamMembers() != null && !project.getTeamMembers().isEmpty()) {
                savedProject.setTeamMembers(new ArrayList<>(project.getTeamMembers()));
            }

            // Final save with relationships
            return projectRepoPort.updateProject(savedProject.getIdProject(), savedProject);

        } catch (Exception e) {
            throw new RuntimeException("Failed to create project: " + e.getMessage(), e);
        }
    }

    @Override
    public Project updateProject(Long id, Project project) {
        Project existing = projectRepoPort.getProjectByIdProject(id)
                .orElseThrow(() -> new RuntimeException("Project with id " + id + " not found"));

        // Update only mutable fields
        existing.setName(project.getName());
        existing.setDescription(project.getDescription());
        existing.setStartDate(project.getStartDate());
        existing.setEndDate(project.getEndDate());
        existing.setStatus(project.getStatus());
        existing.setBudget(project.getBudget());
        existing.setClientName(project.getClientName());
        existing.setPriority(project.getPriority());
        existing.setProgress(project.getProgress());

        // Handle relationships carefully
        if (project.getProjectLeader() != null) {
            existing.setProjectLeader(project.getProjectLeader());
        }

        if (project.getTeamMembers() != null) {
            existing.setTeamMembers(new ArrayList<>(project.getTeamMembers()));
        }

        return projectRepoPort.updateProject(id, existing);
    }

    @Override
    public void deleteProject(Long id) {
        projectRepoPort.deleteProject(id);
    }

    @Override
    public List<Project> getProjectByStatus(String status) {
        return projectRepoPort.getProjectByStatus(status);
    }

    @Override
    public List<Project> getProjectByProjectLeader_CIN(String cin) {
        return projectRepoPort.getProjectByProjectLeader_CIN(cin);
    }

    @Override
    public List<Project> getProjectByClientNameContainingIgnoreCase(String clientName) {
        return projectRepoPort.getProjectByClientNameContainingIgnoreCase(clientName);
    }
    @Override
    public Optional<Project> getProjectByIdProject(Long idProject) {
        return projectRepoPort.getProjectByIdProject(idProject);
    }
}