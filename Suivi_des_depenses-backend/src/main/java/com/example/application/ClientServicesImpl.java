package com.example.application;

import com.example.core.client.Client;
import com.example.core.client.ClientRepoPort;
import com.example.core.client.ClientServices;
import com.example.core.client.Continent;
import org.springframework.stereotype.Service;
import java.util.Optional;

import java.util.List;


@Service
public class ClientServicesImpl implements ClientServices {

    private final ClientRepoPort clientRepoPort;

    public ClientServicesImpl(ClientRepoPort clientRepoPort) {
        this.clientRepoPort = clientRepoPort;
    }

    @Override
    public Client createClient(Client client) {

        return clientRepoPort.saveClient(client);
    }

    @Override
    public List<Client> getAllClients() {
        return clientRepoPort.findAllClients();
    }

    @Override
    public Optional<Client> getClientByReference(String reference) {
        return clientRepoPort.findClientByReference(reference);
    }

    @Override
    public List<Client> getClientsByName(String name) {
        return clientRepoPort.findClientsByName(name);
    }

    @Override
    public List<Client> getClientsByContinent(Continent continent) {
        return clientRepoPort.findClientsByContinent(continent);
    }



    @Override
    public Client updateClient(Long idClient, Client client) {
        Client existingClient = clientRepoPort.findClientById(idClient)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        existingClient.setReference(client.getReference());
        existingClient.setName(client.getName());
        existingClient.setContactPerson(client.getContactPerson());
        existingClient.setEmail(client.getEmail());
        existingClient.setPhoneNumber(client.getPhoneNumber());
        existingClient.setAddress(client.getAddress());
        existingClient.setContinent(client.getContinent());
        existingClient.setRegistrationDate(client.getRegistrationDate());

        return clientRepoPort.saveClient(existingClient);
    }






    public String generateClientReference() {
        Optional<Client> lastClientOpt = clientRepoPort.getLastClientByReference();
        if (lastClientOpt.isPresent()) {
            String lastReference = lastClientOpt.get().getReference();
            int lastNumber = Integer.parseInt(lastReference.substring(2)); // skip "Cl"
            return "Cl" + (lastNumber + 1);
        } else {
            return "Cl1001";
        }
    }



    @Override
    public List<Client> getClientsByAddress(String address) {
        return clientRepoPort.findClientsByAddress(address);
    }


    @Override
    public Optional<Client> findClientById(Long idClient) {
        return clientRepoPort.findClientById(idClient);
    }


}
