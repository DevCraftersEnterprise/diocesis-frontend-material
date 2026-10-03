import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { moduleAccessGuard } from './core/guards/module-access.guard';
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
