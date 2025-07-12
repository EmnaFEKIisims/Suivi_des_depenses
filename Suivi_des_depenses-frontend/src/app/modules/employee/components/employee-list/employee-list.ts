import { Component, OnInit } from '@angular/core';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../employee-service';

declare const bootstrap: any;

@Component({
  selector: 'app-employee-list',
  standalone: false,
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss'
})
export class EmployeeList implements OnInit {
  employees: Employee[] = [];
  isLoading = true;
  errorMessage = '';
  selectedCIN: string | null = null;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (data: Employee[]) => {
        this.employees = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement employés :', err);
        this.errorMessage = 'Erreur lors du chargement des employés.';
        this.isLoading = false;
      }
    });
  }

  openConfirmModal(cin: string): void {
    this.selectedCIN = cin;
    const modalElement = document.getElementById('confirmDeleteModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmDelete(): void {
    if (!this.selectedCIN) return;

    this.employeeService.deleteEmployee(this.selectedCIN).subscribe({
      next: () => {
        this.employees = this.employees.filter(emp => emp.cin !== this.selectedCIN);
        this.selectedCIN = null;

        const modalElement = document.getElementById('confirmDeleteModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          modal?.hide();
        }
      },
      error: () => {
        alert('Failed to delete employee.');
      }
    });
  }
}
