export type IsmaModalidad = 'presencial' | 'en_linea';

export interface IsmaCursoParroquia {
  id: string;
  name: string;
  address: string;
  town: string;
}

export interface IsmaCurso {
  id: string;
  parroquia: IsmaCursoParroquia;
  startDate: string;
  endDate: string;
  finalizado: boolean;
  diaSemana: number | null;
  horaInicio: string | null;
  horaFin: string | null;
  modalidad: IsmaModalidad;
  telefonoInformes: string | null;
  notas: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
}

export interface IsmaCursoForm {
  parroquiaId: string;
  startDate: string;
  endDate: string;
  diaSemana: number | null;
  horaInicio: string;
  horaFin: string;
  modalidad: IsmaModalidad;
  telefonoInformes: string;
  notas: string;
}

export const DIAS_SEMANA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const;
