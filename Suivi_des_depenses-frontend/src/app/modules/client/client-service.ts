import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client } from './models/client.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  
private apiUrl = 'http://localhost:8080/api/clients';

  constructor(private http: HttpClient) {}

  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrl}/createClient`, client);
  }

  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}`);
  }

  getClientByReference(reference: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/getClientByReference/${reference}`);
  }

  getClientsByName(name: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/getClientByName/${name}`);
  }

  getClientsByContinent(continent: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/getClientsByContinent/${continent}`);
  }

  getClientsByAddress(address: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/getClientsByAddress/${address}`);
  }

  updateClient(idClient: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/updateClient/${idClient}`, client);
  }

  generateReference(): Observable<string> {
    return this.http.get(`${this.apiUrl}/generate-reference`, { responseType: 'text' });
  }

  getClientById(idClient: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/getClientById/${idClient}`);
  }

  getContinents(): Observable<string[]> {
  return this.http.get<string[]>(`${this.apiUrl}/continents`);
}


}
