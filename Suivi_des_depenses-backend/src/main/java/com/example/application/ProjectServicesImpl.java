package com.example.application;

import com.example.core.project.Project;
import com.example.core.project.ProjectRepoPort;
import com.example.core.project.ProjectServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
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
        return projectRepoPort.createProject(project);
    }

    @Override
    public Project updateProject(Long id, Project project) {
        Optional<Project> existing = projectRepoPort.getProjectByIdProject(id);
        if (existing.isEmpty()) {
            throw new RuntimeException("Project with id " + id + " not found");
        }
        project.setIdProject(id);
        return projectRepoPort.updateProject(id, project);
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
    public List<Project> getProjectByProjectLeaderId(Long id) {
        return projectRepoPort.getProjectByProjectLeaderId(id);
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
