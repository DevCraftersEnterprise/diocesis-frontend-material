export interface CasoEspecial {
  id: string;
  title: string;
  order: number;
  requisitosAdicionales: string;
  documentosAdicionales: string | null;
  excepciones: string | null;
  contacto: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
}
