package com.example.infrastructure.persistence.project;

import com.example.core.client.Client;
import com.example.core.project.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRepo extends JpaRepository<Project, Long> {


    List<Project> findByStatus(String status);

    List<Project> findByProjectLeader_Reference(String reference);

    @Query("SELECT p FROM Project p WHERE LOWER(p.client.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Project> searchByClientName(@Param("name") String name);

    List<Project> findByClient(Client client);


    Optional<Project> findByReference(String reference);

    Optional<Project> findTopByReferenceStartingWithOrderByReferenceDesc(String prefix);



}
