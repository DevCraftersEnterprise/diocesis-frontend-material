export interface IsmaInformacion {
  id: string;
  introduccion: string;
  documentacionNecesaria: string;
  parroquiaCorrespondiente: string;
  entrevistaParroco: string;
  programaIsma: string;
  tiemposAnticipacion: string;
  contactoTelefono1: string | null;
  contactoTelefono2: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
}

export interface IsmaInformacionForm {
  introduccion: string;
  documentacionNecesaria: string;
  parroquiaCorrespondiente: string;
  entrevistaParroco: string;
  programaIsma: string;
  tiemposAnticipacion: string;
  contactoTelefono1: string;
  contactoTelefono2: string;
}
