import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { moduleAccessGuard } from './core/guards/module-access.guard';
import { adminOnlyGuard } from './core/guards/admin-only.guard';
import { ReverendDetails } from './public/reverend-details/reverend-details';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./public/login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/admin/layout/layout').then((m) => m.Layout),
    children: [
      {
        path: 'users',
        canActivate: [adminOnlyGuard],
        loadComponent: () => import('./admin/users/users').then((m) => m.UsersComponent),
      },
      {
        path: 'carousel',
        loadComponent: () => import('./admin/carousel/carousel').then((m) => m.CarouselComponent),
      },
      {
        path: 'reverends',
        loadComponent: () =>
          import('./admin/reverends/reverends').then((m) => m.ReverendsComponent),
      },
      {
        path: 'news',
        loadComponent: () =>
          import('./admin/newspaper/newspaper').then((m) => m.NewspaperComponent),
      },
      {
        path: 'colonies',
        loadComponent: () => import('./admin/colonies/colonies').then((m) => m.ColoniesComponent),
      },
      {
        path: 'decants',
        loadComponent: () => import('./admin/decants/decants').then((m) => m.DecantsComponent),
      },
      {
        path: 'parishes',
        loadComponent: () => import('./admin/parishes/parishes').then((m) => m.ParishesComponent),
      },
      {
        path: 'articles',
        loadComponent: () => import('./admin/articles/articles').then((m) => m.ArticlesComponent),
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./admin/documents/documents').then((m) => m.DocumentsComponent),
      },
      {
        path: 'paginas',
        loadComponent: () =>
          import('./admin/pages/pagina-contenido-list').then(
            (m) => m.PaginaContenidoListComponent,
          ),
      },
      {
        path: 'downloads',
        loadComponent: () =>
          import('./admin/downloads/downloads').then((m) => m.DownloadsComponent),
      },
      {
        path: 'multimedia',
        loadComponent: () =>
          import('./admin/multimedia/multimedia').then((m) => m.MultimediaComponent),
      },
      {
        path: 'paginas/:slug',
        loadComponent: () =>
          import('./admin/pages/pagina-contenido-edit').then(
            (m) => m.PaginaContenidoEditComponent,
          ),
      },
      {
        path: 'institute/information',
        canActivate: [moduleAccessGuard('instituto-biblico')],
        loadComponent: () =>
          import('./admin/institute-information/institute-information').then(
            (m) => m.InstituteInformationComponent,
          ),
      },
      {
        path: 'institute/trainings',
        canActivate: [moduleAccessGuard('instituto-biblico')],
        loadComponent: () =>
          import('./admin/institute-trainings/institute-trainings').then(
            (m) => m.InstituteTrainingsComponent,
          ),
      },
      {
        path: 'institute/courses',
        canActivate: [moduleAccessGuard('instituto-biblico')],
        loadComponent: () =>
          import('./admin/institute-courses/institute-courses').then(
            (m) => m.InstituteCoursesComponent,
          ),
      },
      {
        path: 'institute/venues',
        canActivate: [moduleAccessGuard('instituto-biblico')],
        loadComponent: () =>
          import('./admin/institute-venues/institute-venues').then(
            (m) => m.InstituteVenuesComponent,
          ),
      },
      {
        path: 'institute/events',
        canActivate: [moduleAccessGuard('instituto-biblico')],
        loadComponent: () =>
          import('./admin/institute-events/institute-events').then(
            (m) => m.InstituteEventsComponent,
          ),
      },
      {
        path: 'isma/information',
        canActivate: [moduleAccessGuard('isma')],
        loadComponent: () =>
          import('./admin/isma-information/isma-information').then(
            (m) => m.IsmaInformationComponent,
          ),
      },
      {
        path: 'isma/special-cases',
        canActivate: [moduleAccessGuard('isma')],
        loadComponent: () =>
          import('./admin/isma-special-cases/isma-special-cases').then(
            (m) => m.IsmaSpecialCasesComponent,
          ),
      },
      {
        path: 'isma/faq',
        canActivate: [moduleAccessGuard('isma')],
        loadComponent: () => import('./admin/isma-faq/isma-faq').then((m) => m.IsmaFaqComponent),
      },
      {
        path: 'isma/cursos',
        canActivate: [moduleAccessGuard('isma')],
        loadComponent: () =>
          import('./admin/isma-cursos/isma-cursos').then((m) => m.IsmaCursosComponent),
      },
      {
        path: '**',
        redirectTo: 'users',
      },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./layouts/public/layout/layout').then((m) => m.Layout),
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./public/home/home').then((m) => m.Home),
      },
      {
        path: 'noticia/:id',
        loadComponent: () =>
          import('./public/post-details/post-details').then((m) => m.PostDetails),
      },
      {
        path: 'directorio/padres',
        loadComponent: () =>
          import('./public/reverend-search/reverend-search').then((m) => m.ReverendSearch),
      },
      {
        path: 'directorio/padres/:id',
        loadComponent: () =>
          import('./public/reverend-details/reverend-details').then((m) => m.ReverendDetails),
      },
      {
        path: 'directorio/parroquias',
        loadComponent: () =>
          import('./public/parish-search/parish-search').then((m) => m.ParishSearch),
      },
      {
        path: 'directorio/parroquias/:id',
        loadComponent: () =>
          import('./public/parish-details/parish-details').then((m) => m.ParishDetails),
      },
      {
        path: 'noticias',
        loadComponent: () => import('./public/post-search/post-search').then((m) => m.PostSearch),
      },
      {
        path: 'noticias/:tag',
        loadComponent: () => import('./public/post-search/post-search').then((m) => m.PostSearch),
      },
      {
        path: 'diocesis/instituto-biblico',
        loadComponent: () => import('./public/institute/institute').then((m) => m.Institute),
      },
      {
        path: 'diocesis/isma',
        loadComponent: () => import('./public/isma/isma').then((m) => m.Isma),
      },
      {
        path: 'diocesis/isma/cursos/:id',
        loadComponent: () =>
          import('./public/isma/isma-curso-detail/isma-curso-detail').then(
            (m) => m.IsmaCursoDetailComponent,
          ),
      },
      // Rutas del menú público sin módulo en el backend todavía: muestran
      // "En construcción" (Tarea pendiente de información del cliente) en vez de
      // redirigir silenciosamente a inicio. Reemplazar cada una por su vista real
      // conforme vaya llegando el contenido/backend correspondiente.
      {
        path: 'diocesis/historia',
        data: { slug: 'historia' },
        loadComponent: () =>
          import('./public/content-page/content-page').then((m) => m.ContentPage),
      },
      {
        path: 'diocesis/obispo',
        data: { slug: 'obispo' },
        loadComponent: () =>
          import('./public/content-page/content-page').then((m) => m.ContentPage),
      },
      {
        path: 'diocesis/planeacion-pastoral',
        data: { slug: 'planeacion-pastoral' },
        loadComponent: () =>
          import('./public/content-page/content-page').then((m) => m.ContentPage),
      },
      {
        path: 'diocesis/obituario',
        data: { slug: 'obituario' },
        loadComponent: () =>
          import('./public/content-page/content-page').then((m) => m.ContentPage),
      },
      {
        path: 'gobierno/curia',
        data: { slug: 'curia' },
        loadComponent: () =>
          import('./public/content-page/content-page').then((m) => m.ContentPage),
      },
      {
        path: 'gobierno/pastoral',
        data: { slug: 'gobierno-pastoral' },
        loadComponent: () =>
          import('./public/content-page/content-page').then((m) => m.ContentPage),
      },
      {
        path: 'gobierno/actividad-pastoral',
        data: { slug: 'actividad-pastoral' },
        loadComponent: () =>
          import('./public/content-page/content-page').then((m) => m.ContentPage),
      },
      {
        path: 'directorio/diaconos/permanentes',
        title: 'Diáconos Permanentes · En construcción',
        data: { label: 'Diáconos Permanentes' },
        loadComponent: () =>
          import('./public/under-construction/under-construction').then(
            (m) => m.UnderConstruction,
          ),
      },
      {
        path: 'directorio/diaconos/transitorios',
        title: 'Diáconos Transitorios · En construcción',
        data: { label: 'Diáconos Transitorios' },
        loadComponent: () =>
          import('./public/under-construction/under-construction').then(
            (m) => m.UnderConstruction,
          ),
      },
      {
        path: 'seminario',
        data: { slug: 'seminario' },
        loadComponent: () =>
          import('./public/content-page/content-page').then((m) => m.ContentPage),
      },
      {
        path: 'archivo/documentos',
        loadComponent: () =>
          import('./public/archive-documents/archive-documents').then(
            (m) => m.ArchiveDocuments,
          ),
      },
      {
        path: 'archivo/nombramientos',
        data: { slug: 'nombramientos' },
        loadComponent: () =>
          import('./public/content-page/content-page').then((m) => m.ContentPage),
      },
      {
        path: 'descargas',
        loadComponent: () =>
          import('./public/downloads/downloads').then((m) => m.DownloadsPublic),
      },
      {
        path: 'multimedia/misas',
        loadComponent: () =>
          import('./public/multimedia/multimedia').then((m) => m.MultimediaPublic),
      },
      {
        path: 'diezmo',
        data: { slug: 'diezmo' },
        loadComponent: () =>
          import('./public/content-page/content-page').then((m) => m.ContentPage),
      },
      {
        path: '**',
        redirectTo: 'inicio',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
