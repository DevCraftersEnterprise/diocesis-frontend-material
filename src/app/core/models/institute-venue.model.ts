export interface Sede {
  id: string;
  name: string;
  address: string;
  mapsUrl: string;
  picture: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
}
