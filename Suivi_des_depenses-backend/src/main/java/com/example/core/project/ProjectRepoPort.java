package com.example.core.project;

import java.util.List;
import java.util.Optional;

public interface ProjectRepoPort {

    List<Project> getAllProjects();

    Project createProject(Project project);

    Project updateProject(Long id, Project project);

    void deleteProject(Long id);

    List<Project> getProjectByStatus(String status);

    List<Project> getProjectByProjectLeaderId(Long id);

    List<Project> getProjectByClientNameContainingIgnoreCase(String clientName);

    Optional<Project> getProjectByIdProject(Long idProject);

}
