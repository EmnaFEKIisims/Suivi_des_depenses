import { Employee } from "../../employee/models/employee.model";

export class Project {
  idProject!: number;
  name!: string;
  description?: string;
  startDate!: string; 
  endDate?: string;
  status!: string;
  budget?: number;
  clientName!: string;
  priority!: string;
  progress!: number;
  teamMembers!: Employee[];
  projectLeader!: Employee;
}