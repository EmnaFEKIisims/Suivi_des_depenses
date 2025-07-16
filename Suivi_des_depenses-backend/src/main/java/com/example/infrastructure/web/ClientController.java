package com.example.infrastructure.web;


import com.example.core.client.Client;
import com.example.core.client.ClientServices;
import com.example.core.client.Continent;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clients")
public class ClientController {


    private final ClientServices clientServices;

    public ClientController(ClientServices clientServices) {
        this.clientServices = clientServices;
    }

    @PostMapping("/createClient")
    public ResponseEntity<Client> createClient(@RequestBody Client client) {
        Client createdClient = clientServices.createClient(client);
        return ResponseEntity.ok(createdClient);
    }

    @GetMapping
    public ResponseEntity<List<Client>> getAllClients() {
        List<Client> clients = clientServices.getAllClients();
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/getClientByReference/{reference}")
    public ResponseEntity<Client> getClientByReference(@PathVariable String reference) {
        Optional<Client> client = clientServices.getClientByReference(reference);
        return client.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/getClientByName/{name}")
    public ResponseEntity<List<Client>> getClientsByName(@PathVariable String name) {
        List<Client> clients = clientServices.getClientsByName(name);
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/getClientsByContinent/{continent}")
    public ResponseEntity<List<Client>> getClientsByContinent(@PathVariable Continent continent) {
        List<Client> clients = clientServices.getClientsByContinent(continent);
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/getClientsByAddress/{address}")
    public ResponseEntity<List<Client>> getClientsByAddress(@PathVariable String address) {
        List<Client> clients = clientServices.getClientsByAddress(address);
        return ResponseEntity.ok(clients);
    }


    @PutMapping("/updateClient")
    public ResponseEntity<Client> updateClient(@RequestBody Client client) {
        Client updatedClient = clientServices.updateClient(client);
        return ResponseEntity.ok(updatedClient);
    }


}
