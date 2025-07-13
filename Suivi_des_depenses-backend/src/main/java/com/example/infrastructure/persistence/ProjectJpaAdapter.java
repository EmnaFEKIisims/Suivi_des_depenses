package com.example.infrastructure.persistence;

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

        String idProject = String.valueOf(id);

        if (!projectRepository.existsById(idProject)) {
            throw new RuntimeException("Project with id " + idProject + " not found");
        }

        project.setIdProject(idProject);
        return projectRepository.save(project);
    }

    @Override
    @Transactional
    public void deleteProject(Long id) {
        String idProject = String.valueOf(id);
        projectRepository.deleteById(idProject);
    }

    @Override
    public List<Project> getProjectByStatus(String status) {
        return projectRepository.findByStatus(status);
    }

    @Override
    public List<Project> getProjectByProjectLeaderId(Long id) {
        return projectRepository.findByProjectLeaderId(id);
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
