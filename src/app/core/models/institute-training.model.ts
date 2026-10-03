export const INSTITUTE_MODALITIES = ['presencial', 'en_linea', 'mixta'] as const;
export type InstituteModality = (typeof INSTITUTE_MODALITIES)[number];

export interface Capacitacion {
  id: string;
  name: string;
  description: string;
  modality: InstituteModality;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
}
