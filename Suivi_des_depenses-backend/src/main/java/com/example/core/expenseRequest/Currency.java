package com.example.core.expenseRequest;

public enum Currency {

    TND("Tunisian Dinar"),
    USD("US Dollar"),
    EUR("Euro"),
    GBP("British Pound"),
    JPY("Japanese Yen"),
    CAD("Canadian Dollar"),
    AUD("Australian Dollar"),
    CHF("Swiss Franc"),
    CNY("Chinese Yuan"),
    SEK("Swedish Krona"),
    NZD("New Zealand Dollar"),
    MAD("Moroccan Dirham"),
    DZD("Algerian Dinar"),
    LYD("Libyan Dinar"),
    AED("UAE Dirham"),
    QAR("Qatari Riyal"),
    SAR("Saudi Riyal"),
    EGP("Egyptian Pound"),
    INR("Indian Rupee"),
    RUB("Russian Ruble"),
    TRY("Turkish Lira"),
    BRL("Brazilian Real"),
    ZAR("South African Rand"),
    KRW("South Korean Won"),
    SGD("Singapore Dollar"),
    HKD("Hong Kong Dollar"),
    NOK("Norwegian Krone"),
    DKK("Danish Krone"),
    PLN("Polish Zloty"),
    THB("Thai Baht"),
    MYR("Malaysian Ringgit"),
    IDR("Indonesian Rupiah"),
    HUF("Hungarian Forint"),
    CZK("Czech Koruna"),
    PHP("Philippine Peso"),
    CLP("Chilean Peso"),
    PKR("Pakistani Rupee"),
    BDT("Bangladeshi Taka"),
    COP("Colombian Peso"),
    VND("Vietnamese Dong"),
    NGN("Nigerian Naira"),
    ARS("Argentine Peso"),
    PEN("Peruvian Sol"),
    KWD("Kuwaiti Dinar"),
    OMR("Omani Rial"),
    JOD("Jordanian Dinar"),
    LBP("Lebanese Pound"),
    BHD("Bahraini Dinar"),
    XOF("West African CFA Franc"),
    XAF("Central African CFA Franc"),
    XPF("CFP Franc"),
    ISK("Icelandic Króna"),
    HRK("Croatian Kuna"),
    RON("Romanian Leu"),
    BGN("Bulgarian Lev"),
    UAH("Ukrainian Hryvnia"),
    RSD("Serbian Dinar"),
    BYN("Belarusian Ruble");


    private final String description;

    Currency(String description) {
        this.description = description;
    }

    // ✅ Getter utile pour accéder à la description
    public String getDescription() {
        return description;
    }


}
