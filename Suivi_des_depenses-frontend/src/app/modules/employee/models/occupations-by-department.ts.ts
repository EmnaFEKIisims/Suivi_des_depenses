import { Department } from './employee.model';

export const OCCUPATIONS_BY_DEPARTMENT: Record<Department, string[]> = {
  [Department.IT]: [
    'Développeur FullStack',
    'Administrateur Systèmes',
    'Technicien Support',
    'Chef de Projet IT',
    'Ingénieur Réseau' ,
    'Software Engineer'
  ],
  [Department.MAINTENANCE]: [
    'Technicien de Maintenance',
    'Ingénieur Maintenance',
    'Responsable Maintenance',
    'Planificateur Maintenance',
    'Agent de Maintenance Électrique'
  ],
  [Department.COMMERCIAL]: [
    'Responsable Commercial',
    'Chargé de Clientèle',
    'Ingénieur Commercial',
    'Représentant des Ventes',
    'Assistant Commercial'
  ],
  [Department.COMPTABILITE]: [
    'Comptable',
    'Chef Comptable',
    'Contrôleur de Gestion',
    'Assistant Comptable',
    'Auditeur Financier'
  ],
  [Department.RH]: [
    'Chargé de Recrutement',
    'Responsable RH',
    'Gestionnaire Paie',
    'Assistant RH',
    'Formateur Interne'
  ],
  [Department.PRODUCTION]: [
    'Opérateur de Production',
    'Chef d’Équipe',
    'Responsable de Ligne',
    'Ingénieur Production',
    'Planificateur de Production'
  ],
  [Department.BATIMENT_INFRASTRUCTURE]: [
    'Chef de Chantier',
    'Ingénieur Bâtiment',
    'Technicien Infrastructure',
    'Responsable des Installations',
    'Coordinateur de Travaux'
  ]
};
