package com.example.core.project;

import com.example.core.client.Client;

import java.util.List;
import java.util.Optional;

public interface ProjectServices {

    List<Project> getAllProjects();

    Project createProject(Project project);

    Project updateProject(Long id, Project project);

    List<Project> getProjectByStatus(String status);

    List<Project> getProjectByProjectLeader_Reference(String cin);

    List<Project> getProjectByClientNameContainingIgnoreCase(String clientName);

    Optional<Project> getProjectById(Long id);

    List<Project> getProjectsByClient(Client client);

    Optional<Project> getProjectByReference(String reference);

    String generateProjectReference();


}
