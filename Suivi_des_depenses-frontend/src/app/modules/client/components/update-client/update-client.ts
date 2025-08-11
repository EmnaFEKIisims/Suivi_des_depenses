import { Component , OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../../client-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-update-client',
  standalone: false,
  templateUrl: './update-client.html',
  styleUrl: './update-client.scss'
})
export class UpdateClient implements OnInit {

  clientForm!: FormGroup;
  showSuccessAlert = false;
  showErrorAlert = false;
  errorMessage = '';
  continents: string[] = [];

  idClient!: number;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    
    this.idClient = Number(this.route.snapshot.paramMap.get('idClient'));

    
    this.clientForm = this.fb.group({
      reference: [{ value: '', disabled: true }],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      registrationDate: ['', Validators.required],
      address: ['', Validators.required],
      continent: ['', Validators.required],
      contactPerson: ['', Validators.required],
      phoneNumber: ['', Validators.required]
    });

    // Charger la liste des continents
    this.clientService.getContinents().subscribe({
      next: continents => this.continents = continents,
      error: err => console.error('Erreur récupération continents', err)
    });

    // Charger les données du client à modifier
    this.clientService.getClientById(this.idClient).subscribe({
      next: client => this.clientForm.patchValue({
        reference: client.reference,
        name: client.name,
        email: client.email,
        registrationDate: this.formatDate(client.registrationDate),
        address: client.address,
        continent: client.continent,
        contactPerson: client.contactPerson,
        phoneNumber: client.phoneNumber
      }),
      error: err => {
        this.errorMessage = 'Impossible de charger les données du client.';
        this.showErrorAlert = true;
      }
    });
  }

  // Fonction pour formater une date en yyyy-MM-dd pour l'input date HTML
  private formatDate(date: string | Date): string {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  onUpdate(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    // Préparer les données à envoyer en retirant 'reference' qui est désactivé dans le form
    const updatedClient = {
      ...this.clientForm.getRawValue()  // getRawValue() inclut les champs désactivés
    };

    this.clientService.updateClient(this.idClient, updatedClient).subscribe({
      next: () => {
        this.showSuccessAlert = true;
        this.showErrorAlert = false;
        setTimeout(() => this.router.navigate(['/clients']), 2000);
      },
      error: err => {
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour du client.';
        this.showErrorAlert = true;
        this.showSuccessAlert = false;
        setTimeout(() => this.showErrorAlert = false, 5000);
      }
    });
  }

  navigateTo(url: string): void {
    this.router.navigateByUrl(url);
  }

}
