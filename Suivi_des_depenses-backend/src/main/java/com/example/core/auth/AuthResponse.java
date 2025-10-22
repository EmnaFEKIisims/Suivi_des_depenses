package com.example.core.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {

    //Returns the JWT after successful authentication.
    private String token;

}
