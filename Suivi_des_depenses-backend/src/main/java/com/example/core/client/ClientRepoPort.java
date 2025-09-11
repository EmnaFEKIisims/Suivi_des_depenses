package com.example.core.client;

import com.example.core.client.Client;

import java.util.List;
import java.util.Optional;

public interface ClientRepoPort {

    Client saveClient(Client client);

    List<Client> findAllClients();

    Optional<Client> findClientByReference(String reference);

    Optional<Client> findClientById(Long idClient);

    List<Client> findClientsByName(String name);

    List<Client> findClientsByContinent(Continent continent);

    Client updateClient(Long idClient, Client client);

    List<Client> findClientsByAddress(String address);

    Optional<Client> getLastClientByReference();



}
