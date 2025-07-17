package com.example.core.project;

import com.example.core.client.Client;

import java.util.List;
import java.util.Optional;

public interface ProjectRepoPort {

    List<Project> getAllProjects();

    Project createProject(Project project);

    Project updateProject(Long id, Project project);

    List<Project> getProjectByStatus(String status);

    List<Project> getProjectByProjectLeader_CIN(String cin);

    List<Project> getProjectByClientNameContainingIgnoreCase(String clientName);

    Optional<Project> getProjectByIdProject(Long idProject);

    List<Project> findByClient(Client client);

    Optional<Project> findByReference(String reference);

    Optional<Project> getLastProjectByReference();

}
