export type DocumentType =
  | 'carta'
  | 'circular'
  | 'comunicado'
  | 'prensa'
  | 'decreto'
  | 'instruccion'
  | 'mensaje'
  | 'dominical'
  | 'rescripto';

/** Compartido entre el admin y la vista pública de Archivo > Documentos. */
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  carta: 'Carta',
  circular: 'Circular',
  comunicado: 'Comunicado',
  prensa: 'Prensa',
  decreto: 'Decreto',
  instruccion: 'Instrucción',
  mensaje: 'Mensaje',
  dominical: 'Dominical',
  rescripto: 'Rescripto',
};

export interface Documento {
  id: string;
  title: string;
  document: string;
  tags: string[];
  type: DocumentType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
}
