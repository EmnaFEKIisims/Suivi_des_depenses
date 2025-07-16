import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { Observable, forkJoin , of } from 'rxjs';
import { ExpenseRequestService } from '../../expense-request-service';
import { ExpenseRequest, ExpenseStatus } from '../../models/expense-request.model';
import { EmployeeService } from '../../../employee/employee-service';
import { ProjectService } from '../../../project/project-service';
import { timeout, map , catchError} from 'rxjs/operators';
import { getFormattedTotals } from '../../models/expense-request.model';

@Component({
  selector: 'app-request-list',
  standalone: false,
  templateUrl: './request-list.html',
  styleUrl: './request-list.scss'
})
export class RequestList implements OnInit {
    displayedColumns: string[] = [
    'select',
    'idRequest',
    'employeeCin',
    'startDate',
    'returnDate',
    'mission',
    'totalAmount',
    'status',
    'actions'
  ];
  dataSource = new MatTableDataSource<ExpenseRequest>();
  selection = new SelectionModel<ExpenseRequest>(true, []);
  isLoading = true;
  statusFilter = '';
  searchTerm = '';
  

  // Options for filters
  statusOptions = Object.values(ExpenseStatus);

  constructor(
    private expenseRequestService: ExpenseRequestService,
    private employeeService: EmployeeService,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
  this.isLoading = true;
  this.expenseRequestService.getAllExpenseRequests().pipe(
    timeout(10000),
    catchError(err => {
      console.error('Error loading requests:', err);
      this.isLoading = false;
      this.dataSource.data = [];
      return of([]); // Retourne un tableau vide pour continuer le flux
    })
  ).subscribe({
    next: (requests) => {
      if (!requests || requests.length === 0) {
        this.isLoading = false;
        this.dataSource.data = [];
        return;
      }

      const observables = requests.map(request => 
        forkJoin({
          employee: this.employeeService.getEmployeeByCIN(request.employee?.cin || '').pipe(
            catchError(() => of({ fullName: 'Unknown Employee', cin: request.employee?.cin || '' } as any))
          ),
          project: this.projectService.getProjectById(request.project?.idProject || 0).pipe(
            catchError(() => of({ name: 'Unknown Project', idProject: request.project?.idProject || 0 } as any))
          )
        }).pipe(
          map(({ employee, project }) => ({
            ...request,
            employee,
            project
          }))
        ));

      forkJoin(observables).subscribe({
        next: (mappedRequests) => {
          this.dataSource.data = mappedRequests;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error in forkJoin:', err);
          this.isLoading = false;
          this.dataSource.data = [];
        }
      });
    }
  });
}

  applyFilter(): void {
    this.dataSource.filterPredicate = (data: ExpenseRequest, filter: string) => {
      const filterObject = JSON.parse(filter);
      const searchTerm = filterObject.search.toLowerCase();
      const matchesSearch =
        (data.project?.name?.toLowerCase()?.includes(searchTerm) || false) ||
        (data.employee?.fullName?.toLowerCase()?.includes(searchTerm) || false);
      const matchesStatus = filterObject.status === '' || data.status === filterObject.status;
      return matchesSearch && matchesStatus;
    };

    this.dataSource.filter = JSON.stringify({
      search: this.searchTerm,
      status: this.statusFilter
    });
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  viewDetails(request: ExpenseRequest): void {
  this.router.navigate(['/requests', request.idRequest]);
}

  private formatRequestDetails(request: ExpenseRequest): string {
    return `
      <div class="request-details">
        <p><strong>Employee:</strong> ${request.employee?.fullName || 'N/A'}</p>
        <p><strong>Mission:</strong> ${request.mission}</p>
        <p><strong>Location:</strong> ${request.missionLocation}</p>
        <p><strong>Status:</strong> ${request.status}</p>
        <p><strong>Total Amount:</strong> ${this.calculateTotal(request)}</p>
      </div>
    `;
  }

  editRequest(request: ExpenseRequest): void {
    this.router.navigate(['/requests/edit', request.idRequest]);
  }

  deleteRequest(id: number): void {
    if (confirm('Are you sure you want to delete this request?')) {
      this.expenseRequestService.deleteExpenseRequest(id).subscribe({
        next: () => {
          this.loadRequests();
        },
        error: (err) => console.error('Error deleting request:', err)
      });
    }
  }

  bulkSubmit(): void {
    const selectedIds = this.selection.selected.map(r => r.idRequest);
    if (selectedIds.length === 0) return;

    if (confirm(`Submit ${selectedIds.length} selected requests for approval?`)) {
      // Implement bulk submit logic if needed
    }
  }

  getStatusColor(status: ExpenseStatus): string {
    switch (status) {
      case ExpenseStatus.DRAFT:
        return 'secondary';
      case ExpenseStatus.APPROVED:
        return 'success';
      case ExpenseStatus.REJECTED:
        return 'warn';
      case ExpenseStatus.SUBMITTED:
        return 'primary';
      case ExpenseStatus.PROCESSED:
        return 'accent';
      default:
        return '';
    }
  }

  calculateTotal(request: ExpenseRequest): string {
    return getFormattedTotals(request) || 'N/A';
  }


  
}