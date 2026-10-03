export type UserRole = 'super' | 'admin' | 'user';

/** Modulos nuevos (etapa Instituto Biblico / ISMA) administrables por un `user` sin ser
 * admin/super general. Ver backend `docs/instituto-biblico-isma.md` §4. */
export type AppModuleName = 'instituto-biblico' | 'isma';

export const MODULE_ACCESS_OPTIONS: {
  value: AppModuleName;
  label: string;
}[] = [
  { value: 'instituto-biblico', label: 'Instituto Bíblico' },
  { value: 'isma', label: 'ISMA' },
];

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  moduleAccess: AppModuleName[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  updatedBy?: User | null;
  deletedBy?: User | null;
}
