package com.example.infrastructure.persistence.project;

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
    @Transactional
    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    @Override
    public List<Project> getProjectByStatus(String status) {
        return projectRepository.findByStatus(status);
    }

    @Override
    public List<Project> getProjectByProjectLeader_CIN(String cin) {
        return projectRepository.findByProjectLeader_CIN(cin);
    }

    @Override
    public List<Project> getProjectByClientNameContainingIgnoreCase(String clientName) {
        return projectRepository.findByClientNameContainingIgnoreCase(clientName);
    }

    @Override
    public Optional<Project> getProjectByIdProject(Long idProject) {
        return projectRepository.findByIdProject(idProject);
    }
}
