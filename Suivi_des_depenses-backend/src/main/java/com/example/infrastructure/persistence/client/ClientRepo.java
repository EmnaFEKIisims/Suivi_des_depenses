package com.example.infrastructure.persistence.client;

import com.example.core.client.Client;
import com.example.core.client.Continent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClientRepo extends JpaRepository<Client, Long> {

    Optional<Client> findByReference(String reference);

    @Override
    Optional<Client> findById(Long aLong);


    List<Client> findByContinent(Continent continent);

    List<Client> findByAddress(String address);

    List<Client> findByNameContainingIgnoreCase(String name);

    Optional<Client> findTopByReferenceStartingWithOrderByReferenceDesc(String prefix);






}
