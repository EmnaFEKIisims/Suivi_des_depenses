export interface ExpenseDetails {
  id?: number;
  description: string;
  amount: number;
  currency: string; 
  currencyDescription?: string;
  expenseRequestId?: number; 
}



export const CURRENCY_LIST = [
  { code: 'TND', description: 'Tunisian Dinar' },
  { code: 'USD', description: 'US Dollar' },
  { code: 'EUR', description: 'Euro' },
  { code: 'GBP', description: 'British Pound' },
  { code: 'JPY', description: 'Japanese Yen' },
  { code: 'CAD', description: 'Canadian Dollar' },
  { code: 'AUD', description: 'Australian Dollar' },
  { code: 'CHF', description: 'Swiss Franc' },
  { code: 'CNY', description: 'Chinese Yuan' },
  { code: 'SEK', description: 'Swedish Krona' },
  { code: 'NZD', description: 'New Zealand Dollar' },
  { code: 'MAD', description: 'Moroccan Dirham' },
  { code: 'DZD', description: 'Algerian Dinar' },
  { code: 'LYD', description: 'Libyan Dinar' },
  { code: 'AED', description: 'UAE Dirham' },
  { code: 'QAR', description: 'Qatari Riyal' },
  { code: 'SAR', description: 'Saudi Riyal' },
  { code: 'EGP', description: 'Egyptian Pound' },
  { code: 'INR', description: 'Indian Rupee' },
  { code: 'RUB', description: 'Russian Ruble' },
  { code: 'TRY', description: 'Turkish Lira' },
  { code: 'BRL', description: 'Brazilian Real' },
  { code: 'ZAR', description: 'South African Rand' },
  { code: 'KRW', description: 'South Korean Won' },
  { code: 'SGD', description: 'Singapore Dollar' },
  { code: 'HKD', description: 'Hong Kong Dollar' },
  { code: 'NOK', description: 'Norwegian Krone' },
  { code: 'DKK', description: 'Danish Krone' },
  { code: 'PLN', description: 'Polish Zloty' },
  { code: 'THB', description: 'Thai Baht' },
  { code: 'MYR', description: 'Malaysian Ringgit' },
  { code: 'IDR', description: 'Indonesian Rupiah' },
  { code: 'HUF', description: 'Hungarian Forint' },
  { code: 'CZK', description: 'Czech Koruna' },
  { code: 'PHP', description: 'Philippine Peso' },
  { code: 'CLP', description: 'Chilean Peso' },
  { code: 'PKR', description: 'Pakistani Rupee' },
  { code: 'BDT', description: 'Bangladeshi Taka' },
  { code: 'COP', description: 'Colombian Peso' },
  { code: 'VND', description: 'Vietnamese Dong' },
  { code: 'NGN', description: 'Nigerian Naira' },
  { code: 'ARS', description: 'Argentine Peso' },
  { code: 'PEN', description: 'Peruvian Sol' },
  { code: 'KWD', description: 'Kuwaiti Dinar' },
  { code: 'OMR', description: 'Omani Rial' },
  { code: 'JOD', description: 'Jordanian Dinar' },
  { code: 'LBP', description: 'Lebanese Pound' },
  { code: 'BHD', description: 'Bahraini Dinar' },
  { code: 'XOF', description: 'West African CFA Franc' },
  { code: 'XAF', description: 'Central African CFA Franc' },
  { code: 'XPF', description: 'CFP Franc' },
  { code: 'ISK', description: 'Icelandic Króna' },
  { code: 'HRK', description: 'Croatian Kuna' },
  { code: 'RON', description: 'Romanian Leu' },
  { code: 'BGN', description: 'Bulgarian Lev' },
  { code: 'UAH', description: 'Ukrainian Hryvnia' },
  { code: 'RSD', description: 'Serbian Dinar' },
  { code: 'BYN', description: 'Belarusian Ruble' }
];



export function getCurrencyDescription(code: string): string {
  const currency = CURRENCY_LIST.find(c => c.code === code);
  return currency ? currency.description : '';
}