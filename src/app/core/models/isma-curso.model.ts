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
  modalidades: IsmaModalidad[];
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
  modalidades: IsmaModalidad[];
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

export const MODALIDAD_LABELS: Record<IsmaModalidad, string> = {
  presencial: 'Presencial',
  en_linea: 'En línea',
};

export function etiquetasModalidades(modalidades: IsmaModalidad[]): string {
  return modalidades.map((m) => MODALIDAD_LABELS[m]).join(' y ');
}

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

/** Formatea una fecha ISO "yyyy-MM-dd" (sin hora) como "8 de septiembre de 2026", sin
 * pasar por `Date` para evitar corrimientos de zona horaria. */
export function fechaLarga(iso: string): string {
  const [anio, mes, dia] = iso.split('-').map(Number);
  if (!anio || !mes || !dia) return iso;
  return `${dia} de ${MESES[mes - 1]} de ${anio}`;
}
