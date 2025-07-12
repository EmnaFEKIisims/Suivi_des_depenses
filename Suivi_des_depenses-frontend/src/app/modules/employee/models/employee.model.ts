export interface Employee {


  cin: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  gender: string;
  hireDate: Date | string;  
  department: string;
  occupation: string;
  username: string;
  password: string;
}


export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female'
}

export enum Department {
  IT = 'IT',
  MAINTENANCE = 'Maintenance',
  COMMERCIAL = 'Commercial',
  COMPTABILITE = 'Comptabilité',
  RH = 'Ressources Humaines',
  PRODUCTION = 'Production',
  BATIMENT_INFRASTRUCTURE = 'Bâtiment & Infrastructure'
}



