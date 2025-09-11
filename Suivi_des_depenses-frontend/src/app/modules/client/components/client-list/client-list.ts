import { Component , OnInit, ViewEncapsulation} from '@angular/core';
import { Client } from '../../models/client.model';
import { ClientService } from '../../client-service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-client-list',
  standalone: true,
  templateUrl: './client-list.html',
  styleUrls: [
    '../../../../shared/styles/executive-list-template.scss',
    './client-list.scss'
  ],
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    NgClass
  ]
})
export class ClientList implements OnInit {
   clients: Client[] = [];
  filteredClients: Client[] = [];
  continents: string[] = [];
  selectedContinent: string = 'ALL';
  searchTerm: string = '';
  isLoading = true;
  errorMessage = '';

  constructor(private clientService: ClientService, private router: Router) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadContinents();
  }

  loadClients(): void {
    this.isLoading = true;
    this.clientService.getAllClients().pipe(
      catchError(err => {
        console.error('Error loading clients:', err);
        this.errorMessage = 'Failed to load clients. Please try again later.';
        this.isLoading = false;
        return of([]);
      })
    ).subscribe((data: Client[]) => {
      this.clients = data;
      this.filteredClients = [...this.clients];
      this.isLoading = false;
    });
  }

  loadContinents(): void {
    this.clientService.getContinents().pipe(
      catchError(err => {
        console.error('Error loading continents:', err);
        return of([]);
      })
    ).subscribe((data: string[]) => {
      this.continents = data;
    });
  }

  applyFilters(): void {
    this.filteredClients = this.clients.filter(client => {
      const matchesContinent = this.selectedContinent === 'ALL' || 
                             client.continent === this.selectedContinent;
      
      const matchesSearch = !this.searchTerm ||
                          client.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          client.address.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesContinent && matchesSearch;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onContinentChange(): void {
    this.applyFilters();
  }

  goToCreateClient(): void {
    this.router.navigate(['/add-client']);
  }

  goToEditClient(id: number): void {
    this.router.navigate(['/update-client', id]);
  }

  goToClientDetails(id: number): void {
    this.router.navigate(['/clients/details', id]);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  refreshClients(): void {
    this.loadClients();
  }

}
