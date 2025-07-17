package com.example.infrastructure.persistence.ExpenseRequest;

import com.example.core.expenseRequest.*;
import com.example.core.expenseRequest.ExpenseRequestRepoPort;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
@Repository
@RequiredArgsConstructor

public class ExpenseRequestJpaAdapter implements ExpenseRequestRepoPort {

    private final ExpenseRequestRepo requestRepository;
    private final ExpenseDetailsRepo detailsRepository;

    // ============= ExpenseRequest CRUD Operations =============
    @Override
    @Transactional
    public ExpenseRequest saveRequest(ExpenseRequest request) {
        return requestRepository.save(request);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ExpenseRequest> findRequestById(Long id) {
        return requestRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseRequest> findAllRequests() {
        return (List<ExpenseRequest>) requestRepository.findAll();
    }



    // ============= ExpenseDetails Operations =============
    @Override
    @Transactional
    public ExpenseDetails saveDetail(ExpenseDetails detail) {
        return detailsRepository.save(detail);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ExpenseDetails> findDetailById(Long id) {
        return detailsRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseDetails> findDetailsByRequestId(Long requestId) {
        return detailsRepository.findByExpenseRequestIdRequest(requestId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseDetails> findDetailsByRequestIdAndCurrency(Long requestId, String currency) {
        return detailsRepository.findByExpenseRequestIdRequestAndCurrency(requestId, currency);
    }

    @Override
    @Transactional
    public void deleteDetailById(Long id) {
        detailsRepository.deleteById(id);
    }

    // ============= Query Methods =============
    @Override
    @Transactional(readOnly = true)
    public List<ExpenseRequest> findByStatus(ExpenseStatus status) {
        return requestRepository.findByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseRequest> findByEmployeeId(String employeeCin) {
        return requestRepository.findByEmployeeCin(employeeCin);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseRequest> findByProjectId(Long projectId) {
        return requestRepository.findByProjectId(projectId);
    }

    // ============= Custom Updates =============
    @Override
    @Transactional
    public void updateRequestStatus(Long requestId, ExpenseStatus newStatus) {
        ExpenseRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("ExpenseRequest not found"));
        request.setStatus(newStatus);
        requestRepository.save(request);
    }

    @Override
    @Transactional
    public void updateDetailAmount(Long detailId, Double newAmount) {
        ExpenseDetails detail = detailsRepository.findById(detailId)
                .orElseThrow(() -> new EntityNotFoundException("ExpenseDetail not found"));
        detail.setAmount(newAmount);
        detailsRepository.save(detail);
    }

    // ============= Aggregation Methods =============
    @Override
    @Transactional(readOnly = true)
    public Map<Currency, Double> sumAmountsByCurrencyForRequest(Long requestId) {
        return detailsRepository.findByExpenseRequestIdRequest(requestId)
                .stream()
                .collect(Collectors.groupingBy(
                        ExpenseDetails::getCurrency,
                        Collectors.summingDouble(ExpenseDetails::getAmount)
                ));
    }

    @Override
    @Transactional(readOnly = true)
    public Double sumAllAmountsByEmployeeAndStatus(String employeeCin, ExpenseStatus status) {
        return requestRepository.findByEmployeeCinAndStatus(employeeCin, status)
                .stream()
                .flatMap(request -> request.getDetails().stream())
                .mapToDouble(ExpenseDetails::getAmount)
                .sum();
    }

    @Override
    public List<ExpenseRequest> findRequestsByCurrency(Currency currency) {
        return requestRepository.findByCurrency(currency);
    }

    @Override
    public Optional<ExpenseRequest> findTopByOrderByReferenceDesc() {
        return requestRepository.findTopByOrderByReferenceDesc();
    }

    @Override
    public String generateReference() {
        Optional<ExpenseRequest> lastRequest = findTopByOrderByReferenceDesc();
        if (lastRequest.isPresent()) {
            String lastRef = lastRequest.get().getReference();
            int lastNumber = Integer.parseInt(lastRef.replace("Rqs", ""));
            return "Rqs" + (lastNumber + 1);
        } else {
            return "Rqs1000";
        }
    }




}
