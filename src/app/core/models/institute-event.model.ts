export const EVENTO_TYPES = ['inscripcion', 'curso', 'actividad'] as const;
export type EventoType = (typeof EVENTO_TYPES)[number];

export interface Evento {
  id: string;
  title: string;
  description: string | null;
  type: EventoType;
  startDate: string;
  endDate: string | null;
  cursoId: string | null;
  sedeId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
}
