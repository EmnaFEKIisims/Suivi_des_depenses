package com.example.infrastructure.persistence.client;



import com.example.core.client.Client;
import com.example.core.client.ClientRepoPort;
import com.example.core.client.Continent;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClientJpaAdapter implements ClientRepoPort {

    private final ClientRepo clientRepo;

    public ClientJpaAdapter(ClientRepo clientRepo) {
        this.clientRepo = clientRepo;
    }

    @Override
    public Client saveClient(Client client) {
        return clientRepo.save(client);
    }

    @Override
    public List<Client> findAllClients() {
        return clientRepo.findAll();
    }

    @Override
    public Optional<Client> findClientByReference(String reference) {
        return clientRepo.findByReference(reference);
    }

    @Override
    public List<Client> findClientsByName(String name) {
        return clientRepo.findByNameContainingIgnoreCase(name);
    }

    @Override
    public List<Client> findClientsByContinent(Continent continent) {
        return clientRepo.findByContinent(continent);
    }

    @Override
    public List<Client> findClientsByAddress(String address) {
        return clientRepo.findByAddress(address);
    }


    @Override
    public Client updateClient(Client client) {
        return clientRepo.save(client);
    }


}
