package com.example.security;

import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import org.springframework.stereotype.Component;


@Component
public class TotpMfaUtil {

    private final CodeVerifier codeVerifier;

    public TotpMfaUtil(CodeVerifier codeVerifier) {
        this.codeVerifier = codeVerifier;
    }

    public String generateSecret() {
        SecretGenerator secretGenerator = new DefaultSecretGenerator();
        return secretGenerator.generate();
    }

    public byte[] generateQrCode(String secret, String email) throws Exception {
        QrData data = new QrData.Builder()
                .label(email)
                .secret(secret)
                .issuer("EmployeeApp")
                .build();
        QrGenerator qrGenerator = new ZxingPngQrGenerator();
        return qrGenerator.generate(data);
    }

    public boolean verifyCode(String secret, String code) {
        return codeVerifier.isValidCode(secret, code);
    }

}
