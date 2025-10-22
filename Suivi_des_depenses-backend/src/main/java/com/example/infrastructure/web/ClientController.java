package com.example.infrastructure.web;


import com.example.core.client.Client;
import com.example.core.client.ClientServices;
import com.example.core.client.Continent;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "http://localhost:4200")
public class ClientController {


    private final ClientServices clientServices;

    public ClientController(ClientServices clientServices) {
        this.clientServices = clientServices;
    }

    @PostMapping("/createClient")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Client> createClient(@RequestBody Client client) {
        Client createdClient = clientServices.createClient(client);
        return ResponseEntity.ok(createdClient);
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<Client>> getAllClients() {
        List<Client> clients = clientServices.getAllClients();
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/getClientByReference/{reference}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Client> getClientByReference(@PathVariable String reference) {
        Optional<Client> client = clientServices.getClientByReference(reference);
        return client.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/getClientByName/{name}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<Client>> getClientsByName(@PathVariable String name) {
        List<Client> clients = clientServices.getClientsByName(name);
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/getClientsByContinent/{continent}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<Client>> getClientsByContinent(@PathVariable Continent continent) {
        List<Client> clients = clientServices.getClientsByContinent(continent);
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/getClientsByAddress/{address}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<Client>> getClientsByAddress(@PathVariable String address) {
        List<Client> clients = clientServices.getClientsByAddress(address);
        return ResponseEntity.ok(clients);
    }


    @PutMapping("/updateClient/{idClient}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Client> updateClient(@PathVariable Long idClient, @RequestBody Client client) {
        Client updated = clientServices.updateClient(idClient, client);
        return ResponseEntity.ok(updated);
    }



    @GetMapping("/generate-reference")
    public ResponseEntity<String> generateReference() {
        String reference = clientServices.generateClientReference();
        return ResponseEntity.ok(reference);
    }

    @GetMapping("/getClientById/{idClient}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Client> getClientById(@PathVariable Long idClient) {
        Optional<Client> clientOptional = clientServices.findClientById(idClient);
        return clientOptional
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    @GetMapping("/continents")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<Continent>> getContinents() {
        return ResponseEntity.ok(Arrays.asList(Continent.values()));
    }


}
