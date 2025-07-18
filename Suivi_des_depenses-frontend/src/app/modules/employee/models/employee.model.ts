export interface Employee {


  cin: string;
  reference : string;
  fullName: string;
  birthDate : Date | string; 
  email: string;
  phoneNumber: string;
  address: string;
  gender: string;
  hireDate: Date | string;  
  department: string;
  occupation: string;
  status : string;
  exitDate : Date | string; 
  username: string;
  password: string;
}


export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female'
}


export enum Status{
  ACTIF='Actif',
  INACTIF='Inactif'
}

export enum Department {
  IT = 'IT',
  Maintenance = 'Maintenance',
  Commercial = 'Commercial',
  Accounting = 'Accounting',
  HR = 'HR',
  Production = 'Production',
  Building_Infrastructure = 'Building_Infrastructure'
}



