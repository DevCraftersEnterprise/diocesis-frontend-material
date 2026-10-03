export interface InstitutoInformacion {
  id: string;
  name: string;
  description: string;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
}

export interface InstitutoInformacionForm {
  name: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
}
