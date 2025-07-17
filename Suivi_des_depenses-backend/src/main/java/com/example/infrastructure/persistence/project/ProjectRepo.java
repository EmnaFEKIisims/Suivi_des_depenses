package com.example.infrastructure.persistence.project;

import com.example.core.client.Client;
import com.example.core.project.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepo extends JpaRepository<Project, Long> {


    List<Project> findByStatus(String status);

    List<Project> findByProjectLeader_CIN(String cin);

    List<Project> findByClientNameContainingIgnoreCase(String clientName);

    Optional<Project> findByIdProject(Long idProject);

    List<Project> findByClient(Client client);


    Optional<Project> findByReference(String reference);

    Optional<Project> findTopByReferenceStartingWithOrderByReferenceDesc(String prefix);



}
