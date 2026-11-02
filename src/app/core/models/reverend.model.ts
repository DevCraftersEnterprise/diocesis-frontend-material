export type PadreRole = 'presbitero' | 'diacono_permanente' | 'diacono_transitorio';

export const PADRE_ROLE_LABELS: Record<PadreRole, string> = {
  presbitero: 'Presbítero',
  diacono_permanente: 'Diácono Permanente',
  diacono_transitorio: 'Diácono Transitorio',
};

export interface Padre {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  isActive: boolean;
  picture?: string | null;
  email?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  role: PadreRole;
  ordinationDate?: string | null;
  phone?: string | null;
  assignedCommunity?: string | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
}
