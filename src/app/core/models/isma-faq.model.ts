export interface PreguntaFrecuente {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
}
