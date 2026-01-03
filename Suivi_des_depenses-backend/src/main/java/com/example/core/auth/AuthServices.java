package com.example.core.auth;


import java.util.Optional;

public interface AuthServices {

     AuthResponse authenticate(LoginRequest request);

}
