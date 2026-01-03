package com.example.core.auth;

import lombok.Data;

@Data
public class LoginRequest {

    //Holds the login input data (email, password, TOTP code) sent from the Angular frontend.

    private String email;
    private String password;
    private String totpCode;
}

