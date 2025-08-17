package com.example.application;

import com.example.core.client.Client;
import com.example.core.employee.Employee;
import com.example.core.project.Project;
import com.example.core.project.ProjectRepoPort;
import com.example.core.project.ProjectServices;
import com.example.infrastructure.persistence.client.ClientRepo;
import com.example.infrastructure.persistence.employee.EmployeeRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProjectServicesImpl implements ProjectServices {

    private final ProjectRepoPort projectRepoPort;
    private final ClientRepo clientRepository ;
    private final EmployeeRepo employeeRepository;

    @Autowired
    public ProjectServicesImpl(ProjectRepoPort projectRepoPort,
                               ClientRepo clientRepository,
                               EmployeeRepo employeeRepository) {
        this.projectRepoPort = projectRepoPort;
        this.clientRepository = clientRepository;
        this.employeeRepository = employeeRepository;
    }



    @Override
    public List<Project> getAllProjects() {
        return projectRepoPort.getAllProjects();
    }

    @Override
    public Project createProject(Project project) {
        Project newProject = new Project();
        newProject.setReference(project.getReference());
        newProject.setName(project.getName());
        newProject.setDescription(project.getDescription());
        newProject.setStartDate(project.getStartDate());
        newProject.setEndDate(project.getEndDate());
        newProject.setStatus(project.getStatus());
        newProject.setBudget(project.getBudget());
        newProject.setPriority(project.getPriority());
        newProject.setProgress(project.getProgress());

        // Client : charger depuis la DB à partir de l'id
        if (project.getClient() != null && project.getClient().getIdClient() != null) {
            Client clientFromDb = clientRepository.findById(project.getClient().getIdClient())
                    .orElseThrow(() -> new RuntimeException("Client non trouvé"));
            newProject.setClient(clientFromDb);
        }

        // ProjectLeader : charger depuis DB avec reference
        if (project.getProjectLeader() != null && project.getProjectLeader().getReference() != null) {
            Employee leaderFromDb = employeeRepository.findByReference(project.getProjectLeader().getReference())
                    .orElseThrow(() -> new RuntimeException("Leader non trouvé"));
            newProject.setProjectLeader(leaderFromDb);
        }

        // TeamMembers : recharger depuis DB la liste
        if (project.getTeamMembers() != null && !project.getTeamMembers().isEmpty()) {
            Set<Employee> uniqueMembers = project.getTeamMembers().stream()
                    .map(e -> employeeRepository.findByReference(e.getReference())
                            .orElseThrow(() -> new RuntimeException("Membre non trouvé: " + e.getReference())))
                    .collect(Collectors.toSet());

            newProject.setTeamMembers(uniqueMembers);
        }

        return projectRepoPort.createProject(newProject);
    }


    @Override
    @Transactional
    public Project updateProject(Long id, Project project) {
        Project existing = projectRepoPort.getProjectById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Update basic fields
        existing.setName(project.getName());
        existing.setDescription(project.getDescription());
        existing.setStartDate(project.getStartDate());
        existing.setEndDate(project.getEndDate());
        existing.setStatus(project.getStatus());
        existing.setBudget(project.getBudget());
        existing.setPriority(project.getPriority());
        existing.setProgress(project.getProgress());

        // Update client
        if (project.getClient() != null && project.getClient().getIdClient() != null) {
            Client clientFromDb = clientRepository.findById(project.getClient().getIdClient())
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            existing.setClient(clientFromDb);
        }

        // Update project leader
        if (project.getProjectLeader() != null && project.getProjectLeader().getReference() != null) {
            Employee leaderFromDb = employeeRepository.findByReference(project.getProjectLeader().getReference())
                    .orElseThrow(() -> new RuntimeException("Leader not found"));
            existing.setProjectLeader(leaderFromDb);
        }


        if (project.getTeamMembers() != null) {
            Set<Employee> uniqueMembers = project.getTeamMembers().stream()
                    .filter(e -> e.getReference() != null)
                    .map(e -> employeeRepository.findByReference(e.getReference())
                            .orElseThrow(() -> new RuntimeException("Member not found: " + e.getReference())))
                    .collect(Collectors.toSet());
            existing.setTeamMembers(uniqueMembers);
        }
        // If team_members is not provided in the JSON, do nothing to preserve existing teamMembers

        return projectRepoPort.updateProject(id, existing);
    }




    @Override
    public List<Project> getProjectByStatus(String status) {
        return projectRepoPort.getProjectByStatus(status);
    }

    @Override
    public List<Project> getProjectByProjectLeader_Reference(String reference) {
        return projectRepoPort.getProjectByProjectLeader_Reference(reference);
    }

    @Override
    public List<Project> getProjectByClientNameContainingIgnoreCase(String clientName) {
        return projectRepoPort.getProjectByClientNameContainingIgnoreCase(clientName);
    }

    @Override
    public Optional<Project> getProjectById(Long id) {
        return projectRepoPort.getProjectById(id);
    }

    @Override
    public List<Project> getProjectsByClient(Client client) {
        return projectRepoPort.getProjectsByClient(client);
    }

    @Override
    public Optional<Project> getProjectByReference(String reference) {
        return projectRepoPort.getProjectByReference(reference);
    }

    @Override
    public String generateProjectReference() {
        Optional<Project> last = projectRepoPort.getLastProjectByReferencePrefix("PR");
        if (last.isPresent()) {
            String lastRef = last.get().getReference();
            try {
                int number = Integer.parseInt(lastRef.substring(2));
                return "PR" + (number + 1);
            } catch (NumberFormatException e) {
                return "PR1001";
            }
        } else {
            return "PR1001";
        }
    }




}
