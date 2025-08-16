package com.example.infrastructure.persistence.project;

import com.example.core.client.Client;
import com.example.core.project.Project;
import com.example.core.project.ProjectRepoPort;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.List;

@Component
public class ProjectJpaAdapter implements ProjectRepoPort {

    private final ProjectRepo projectRepository;

    @Autowired
    public ProjectJpaAdapter(ProjectRepo projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Override
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @Override
    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    @Override
    public Project updateProject(Long id, Project project) {
        if (!projectRepository.existsById(id)) {
            throw new RuntimeException("Project with id " + id + " not found");
        }
        project.setIdProject(id);
        return projectRepository.save(project);
    }

    @Override
    public List<Project> getProjectByStatus(String status) {
        return projectRepository.findByStatus(status);
    }

    @Override
    public List<Project> getProjectByProjectLeader_Reference(String reference) {
        return projectRepository.findByProjectLeader_Reference(reference);
    }

    @Override
    public List<Project> getProjectByClientNameContainingIgnoreCase(String clientName) {
        return projectRepository.searchByClientName(clientName);
    }

    @Override
    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    @Override
    public List<Project> getProjectsByClient(Client client) {
        return projectRepository.findByClient(client);
    }

    @Override
    public Optional<Project> getProjectByReference(String reference) {
        return projectRepository.findByReference(reference);
    }

    @Override
    public Optional<Project> getLastProjectByReferencePrefix(String prefix) {
        return projectRepository.findTopByReferenceStartingWithOrderByReferenceDesc(prefix);
    }




}
