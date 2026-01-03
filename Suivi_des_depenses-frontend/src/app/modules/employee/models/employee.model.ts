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
  roles: Role[]; // Array of roles (maps to Set<Role> in backend)
  mfaSecret?: string; // Optional, as it can be null
  mfaEnabled: boolean;
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


export enum Role {
  ADMIN = 'ROLE_ADMIN',
  EMPLOYEE = 'ROLE_EMPLOYEE'
}



