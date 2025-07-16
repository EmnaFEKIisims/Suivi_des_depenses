package com.example.core.client;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;


@Entity
@Table(name = "clients")
@Data
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idClient", unique = true, nullable = false)
    private Long idClient;

    @Column(name="reference" ,unique = true, nullable = false)
    private String reference;

    @Column(name="name")
    private String name;

    @Column(name = "contactPerson")
    private String contactPerson;

    @Column(name="email", nullable = false)
    private String email;

    @Column(name="phoneNumber", nullable = false)
    private String phoneNumber;

    @Column(name="address", nullable = false)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(name="continent", nullable = false)
    private Continent continent;

    @Column(name="registrationDate", nullable = false)
    private LocalDate registrationDate ;



    public Continent getContinent() {
        return continent;
    }

    public void setContinent(Continent continent) {
        this.continent = continent;
    }




}
