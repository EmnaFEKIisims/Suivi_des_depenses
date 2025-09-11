import { Component ,OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../../models/client.model';
import { ClientService } from '../../client-service';

@Component({
  selector: 'app-client-details',
  standalone: false,
  templateUrl: './client-details.html',
  styleUrls: ['../../../../shared/styles/executive-details-template.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ClientDetails implements OnInit {

  client!: Client;
  idClient!: number;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.idClient = Number(this.route.snapshot.paramMap.get('idClient'));
    if (this.idClient) {
      this.fetchClientDetails();
    } else {
      this.errorMessage = 'Invalid client ID.';
      this.isLoading = false;
    }
  }

  fetchClientDetails(): void {
    this.clientService.getClientById(this.idClient).subscribe({
      next: (data) => {
        this.client = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error fetching client details.';
        this.isLoading = false;
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }


  navigateToEdit(id: number): void {
  this.router.navigate(['/update-client', id]);
}

}
