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

    @Override
    public ExpenseRequest saveRequest(ExpenseRequest request) {
        return requestRepository.save(request);
    }

    @Override
    public Optional<ExpenseRequest> findRequestById(Long id) {
        return requestRepository.findById(id);
    }

    @Override
    public List<ExpenseRequest> findAllRequests() {
        return (List<ExpenseRequest>) requestRepository.findAll();
    }

    @Override
    public Optional<ExpenseRequest> findTopByOrderByReferenceDesc() {
        return requestRepository.findTopByOrderByReferenceDesc();
    }

    @Override
    public ExpenseDetails saveDetail(ExpenseDetails detail) {
        return detailsRepository.save(detail);
    }

    @Override
    public Optional<ExpenseDetails> findDetailById(Long id) {
        return detailsRepository.findById(id);
    }

    @Override
    public List<ExpenseDetails> findDetailsByRequestId(Long requestId) {
        return detailsRepository.findByExpenseRequestIdRequest(requestId);
    }

    @Override
    public List<ExpenseDetails> findDetailsByRequestIdAndCurrency(Long requestId, String currency) {
        return detailsRepository.findByExpenseRequestIdRequestAndCurrency(requestId, currency);
    }

    @Override
    public void deleteDetailById(Long id) {
        detailsRepository.deleteById(id);
    }

    @Override
    public List<ExpenseRequest> findByStatus(ExpenseStatus status) {
        return requestRepository.findByStatus(status);
    }

    @Override
    public List<ExpenseRequest> findByEmployeeId(String employeeCin) {
        return requestRepository.findByEmployeeCin(employeeCin);
    }

    @Override
    public List<ExpenseRequest> findByProjectId(Long projectId) {
        return requestRepository.findByProjectId(projectId);
    }

    @Override
    public void updateRequestStatus(Long requestId, ExpenseStatus newStatus) {
        ExpenseRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Request not found"));
        request.setStatus(newStatus);
        requestRepository.save(request);
    }

    @Override
    public void updateDetailAmount(Long detailId, Double newAmount) {
        ExpenseDetails detail = detailsRepository.findById(detailId)
                .orElseThrow(() -> new EntityNotFoundException("Detail not found"));
        detail.setAmount(newAmount);
        detailsRepository.save(detail);
    }

    @Override
    public Map<Currency, Double> sumAmountsByCurrencyForRequest(Long requestId) {
        return detailsRepository.findByExpenseRequestIdRequest(requestId)
                .stream()
                .collect(Collectors.groupingBy(
                        ExpenseDetails::getCurrency,
                        Collectors.summingDouble(ExpenseDetails::getAmount)
                ));
    }

    @Override
    public Double sumAllAmountsByEmployeeAndStatus(String employeeCin, ExpenseStatus status) {
        return requestRepository.findByEmployeeCinAndStatus(employeeCin, status)
                .stream()
                .flatMap(req -> req.getDetails().stream())
                .mapToDouble(ExpenseDetails::getAmount)
                .sum();
    }

    @Override
    public List<ExpenseRequest> findRequestsByCurrency(Currency currency) {
        return requestRepository.findByCurrency(currency);
    }

    @Override
    public String generateReference() {
        return findTopByOrderByReferenceDesc()
                .map(last -> {
                    int lastNumber = Integer.parseInt(last.getReference().replace("Rqt", ""));
                    return "Rqt" + (lastNumber + 1);
                })
                .orElse("Rqt1001");
    }
}
