package com.example.core.client;

import java.util.List;
import java.util.Optional;

public interface ClientServices {

    Client createClient(Client client);

    List<Client> getAllClients();

    Optional<Client> getClientByReference(String reference);

    List<Client> getClientsByName(String name);

    List<Client> getClientsByContinent(Continent continent);

    List<Client> getClientsByAddress(String address);

    Client updateClient(Client client);


}
