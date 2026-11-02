export interface PaginaImagen {
  id: string;
  url: string;
  caption: string | null;
  order: number;
}

export interface PaginaContenidoListItem {
  id: string;
  slug: string;
  title: string;
  updatedAt: string;
}

export interface PaginaContenido extends PaginaContenidoListItem {
  body: string;
  images: PaginaImagen[];
}
