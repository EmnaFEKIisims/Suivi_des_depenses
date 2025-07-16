package com.example.infrastructure.persistence;

import com.example.core.expenseRequest.ExpenseRequest;
import com.example.core.expenseRequest.ExpenseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExpenseRequestRepo extends JpaRepository<ExpenseRequest, Long> {

    List<ExpenseRequest> findByStatus(ExpenseStatus status);

    // Using CIN (uppercase) to match the Employee entity field name
    @Query("SELECT er FROM ExpenseRequest er JOIN er.employee e WHERE e.CIN = :cin")
    List<ExpenseRequest> findByEmployeeCin(@Param("cin") String cin);

    @Query("SELECT er FROM ExpenseRequest er JOIN er.project p WHERE p.idProject = :projectId")
    List<ExpenseRequest> findByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT er FROM ExpenseRequest er JOIN er.employee e WHERE e.CIN = :cin AND er.status = :status")
    List<ExpenseRequest> findByEmployeeCinAndStatus(
            @Param("cin") String cin,
            @Param("status") ExpenseStatus status);


}
