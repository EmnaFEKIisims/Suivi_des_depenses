export interface Client {

  idClient?: number;
  reference: string;
  name: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  address: string;
  continent: Continent;
  registrationDate: string;
  projects?: any[];

}


export enum Continent {
  TUNISIA = 'TUNISIA',
  FRANCE = 'FRANCE',
  BELGIUM = 'BELGIUM',
  AFRICA = 'AFRICA',
  EUROPE = 'EUROPE',
  ASIA = 'ASIA',
  NORTH_AMERICA = 'NORTH_AMERICA',
  SOUTH_AMERICA = 'SOUTH_AMERICA',
  AUSTRALIA_OCEANIA = 'AUSTRALIA_OCEANIA',
  ANTARCTICA = 'ANTARCTICA'
}