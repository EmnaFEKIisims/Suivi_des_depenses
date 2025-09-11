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

        // Client: Load from DB using id
        if (project.getClient() != null && project.getClient().getIdClient() != null) {
            Client clientFromDb = clientRepository.findById(project.getClient().getIdClient())
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            newProject.setClient(clientFromDb);
        }

        // ProjectLeader: Load from DB using reference
        if (project.getProjectLeader() != null && project.getProjectLeader().getReference() != null) {
            String leaderReference = project.getProjectLeader().getReference();
            Employee leaderFromDb = employeeRepository.findByReference(leaderReference)
                    .orElseThrow(() -> new RuntimeException("Leader not found: " + leaderReference));
            System.out.println("Setting project leader: " + leaderFromDb.getReference()); // Debug log
            newProject.setProjectLeader(leaderFromDb);
        } else {
            System.out.println("Project leader is null or reference is null"); // Debug log
        }

        // TeamMembers: Load from DB
        if (project.getTeamMembers() != null && !project.getTeamMembers().isEmpty()) {
            Set<Employee> uniqueMembers = project.getTeamMembers().stream()
                    .map(e -> employeeRepository.findByReference(e.getReference())
                            .orElseThrow(() -> new RuntimeException("Member not found: " + e.getReference())))
                    .collect(Collectors.toSet());
            newProject.setTeamMembers(uniqueMembers);
        }

        System.out.println("Saving project: " + newProject); // Debug log
        return projectRepoPort.createProject(newProject);
    }


    @Override
    @Transactional
    public Project updateProject(Long id, Project project) {
        Project existing = projectRepoPort.getProjectById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Debug: Log incoming project data
        System.out.println("Incoming project: " + project.toString());
        System.out.println("Incoming project leader reference: " +
                (project.getProjectLeader() != null ? project.getProjectLeader().getReference() : "null"));
        System.out.println("Incoming team members: " +
                (project.getTeamMembers() != null ? "provided (size: " + project.getTeamMembers().size() + ")" : "null (not provided)"));

        if (project.getTeamMembers() != null) {
            project.getTeamMembers().forEach(member -> {
                System.out.println("Incoming team member reference: " + (member != null ? member.getReference() : "null"));
            });
        } else {
            System.out.println("No team members provided in request");
        }

        // Update basic fields
        if (project.getName() != null) existing.setName(project.getName());
        if (project.getDescription() != null) existing.setDescription(project.getDescription());
        if (project.getStartDate() != null) existing.setStartDate(project.getStartDate());
        if (project.getEndDate() != null) existing.setEndDate(project.getEndDate());
        if (project.getStatus() != null) existing.setStatus(project.getStatus());
        if (project.getBudget() != null) existing.setBudget(project.getBudget());
        if (project.getPriority() != null) existing.setPriority(project.getPriority());
        if (project.getProgress() != null) existing.setProgress(project.getProgress());

        // Update client
        if (project.getClient() != null && project.getClient().getIdClient() != null) {
            Client clientFromDb = clientRepository.findById(project.getClient().getIdClient())
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            existing.setClient(clientFromDb);
            System.out.println("Client set: " + clientFromDb.getIdClient()); // Fixed typo
        }

        // Update project leader
        if (project.getProjectLeader() != null && project.getProjectLeader().getReference() != null) {
            String leaderReference = project.getProjectLeader().getReference().trim();
            System.out.println("Loading project leader from DB: " + leaderReference);
            Employee leaderFromDb = employeeRepository.findByReference(leaderReference)
                    .orElseThrow(() -> new RuntimeException("Leader not found: " + leaderReference));
            existing.setProjectLeader(leaderFromDb);
            System.out.println("Project leader set: " + leaderFromDb.getReference());
        }

        // Update team members - Only if provided
        if (project.getTeamMembers() != null) {
            System.out.println("Processing team members...");
            Set<Employee> existingTeam = existing.getTeamMembers();
            if (existingTeam == null) {
                existingTeam = new HashSet<>();
                existing.setTeamMembers(existingTeam);
            }
            existingTeam.clear();
            System.out.println("Cleared existing team members");

            for (Employee incomingMember : project.getTeamMembers()) {
                if (incomingMember != null && incomingMember.getReference() != null) {
                    String memberReference = incomingMember.getReference().trim();
                    System.out.println("Loading team member from DB: " + memberReference);
                    Employee memberFromDb = employeeRepository.findByReference(memberReference)
                            .orElseThrow(() -> {
                                System.out.println("Failed to find employee with reference: " + memberReference);
                                return new RuntimeException("Member not found: " + memberReference);
                            });
                    existingTeam.add(memberFromDb);
                    System.out.println("Added team member: " + memberFromDb.getReference());
                } else {
                    System.out.println("Skipping invalid team member (null or no reference)");
                }
            }
            System.out.println("Total team members set: " + existingTeam.size());
        } else {
            System.out.println("Team members not provided, keeping existing");
        }

        // Debug: Log final state
        System.out.println("Final project leader: " +
                (existing.getProjectLeader() != null ? existing.getProjectLeader().getReference() : "null"));
        System.out.println("Final team members count: " +
                (existing.getTeamMembers() != null ? existing.getTeamMembers().size() : "null"));
        if (existing.getTeamMembers() != null) {
            existing.getTeamMembers().forEach(member -> {
                System.out.println("Final team member: " + (member != null ? member.getReference() : "null"));
            });
        }

        Project updatedProject = projectRepoPort.updateProject(id, existing);
        System.out.println("Project saved: " + updatedProject.toString());
        return updatedProject;
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
