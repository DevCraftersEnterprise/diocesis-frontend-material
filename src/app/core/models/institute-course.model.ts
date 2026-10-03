import { InstituteModality } from './institute-training.model';

export interface Curso {
  id: string;
  title: string;
  description: string;
  modality: InstituteModality;
  capacitacionId: string | null;
  startDate: string | null;
  endDate: string | null;
  meetingLink: string | null;
  picture: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
}
