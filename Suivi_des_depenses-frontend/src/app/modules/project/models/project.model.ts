import { Employee } from "../../employee/models/employee.model";
import { Client } from "../../client/models/client.model";
import { Status , Priority } from "./project.enums";

export interface Project {
  idProject?: number;
  reference: string;
  name: string;
  description?: string;
  startDate: Date | string;
  endDate:  Date | string;
  status: Status;
  budget?: number;
  client: Client;
  priority: Priority;
  progress: number;
  teamMembers: Employee[];
  projectLeader: Employee;
}