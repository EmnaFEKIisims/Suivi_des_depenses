import { Department } from './employee.model';

export const OCCUPATIONS_BY_DEPARTMENT: Record<Department, string[]> = {
  [Department.IT]: [
    'FullStack Developer',
    'System Administrator',
    'Support Technician', 
    'IT Project Manager', 
    'Network Engineer', 
    'Software Engineer'
  ],
  [Department.Maintenance]: [
    'Maintenance Technician', 
    'Maintenance Engineer', 
    'Maintenance Manager', 
    'Maintenance Planner', 
    'Electrical Maintenance Agent'
  ],
  [Department.Commercial]: [
    'Sales Manager', 
    'Client Representative', 
    'Sales Engineer', 
    'Sales Representative', 
    'Sales Assistant'
  ],
  [Department.Accounting]: [
    'Accountant', 
    'Chief Accountant', 
    'Management Controller', 
    'Accounting Assistant', 
    'Financial Auditor'
  ],
  [Department.HR]: [
    'Recruitment Officer', 
    'HR Manager', 
    'Payroll Manager', 
    'HR Assistant', 
    'Internal Trainer'
  ],
  [Department.Production]: [
    'Production Operator', 
    'Team Leader', 
    'Line Manager', 
    'Production Engineer',
    'Production Planner'
  ],
  [Department.Building_Infrastructure]: [
    'Site Manager', 
    'Construction Engineer', 
    'Infrastructure Technician', 
    'Installation Manager', 
    'Works Coordinator'
  ]
};
