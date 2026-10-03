<h1 align="center">Diócesis Frontend</h1>

<p align="center">
  Sitio público y panel de administración de la Diócesis de Ciudad Obregón, construido con <a href="https://angular.dev/" target="_blank">Angular 21</a> (standalone + zoneless) y Tailwind CSS 4.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Jasmine-8A4182?style=for-the-badge&logo=jasmine&logoColor=white" alt="Jasmine" />
</p>

---

## 📋 Descripción

`diocesis-frontend-material` es la SPA que consume la API de la Diócesis (`diocesis-backend-nest`, que reemplaza progresivamente al backend Django). Incluye:

- **Sitio público**: inicio, noticias (con filtro por tag), directorio de padres y parroquias, y las páginas de **Instituto Bíblico** e **ISMA**.
- **Panel de administración** (`/dashboard`): usuarios, carrusel, padres, noticias, colonias, decanatos, parroquias, artículos, documentos y los módulos **Instituto Bíblico** e **ISMA**.

### ✨ Características principales

- ⚡ Angular 21 con componentes _standalone_, `ChangeDetectionStrategy.OnPush` y **detección de cambios sin zone.js** (`provideZonelessChangeDetection`)
- 🧠 Estado local con **signals** (sin Reactive Forms): formularios como `signal<Form>()` con manejadores `(input)`/`(change)` y validación manual
- 🔐 Sesión con JWT (`jwt-decode`), interceptores de autorización/errores y guards de ruta
- 🧩 **Acceso por módulo**: un usuario `user` con `moduleAccess` ve y edita solo Instituto Bíblico y/o ISMA; `admin`/`super` ven todo
- 📅 Calendario visual del Instituto Bíblico con `@fullcalendar/angular`, eventos coloreados por tipo
- 🪗 Acordeón de casos especiales y preguntas frecuentes en la página pública de ISMA
- 🎨 Tailwind CSS 4, iconos `lucide-angular`, notificaciones `ngx-toastr`

## 📑 Tabla de contenidos

- [Requisitos](#-requisitos)
- [Puesta en marcha](#-puesta-en-marcha)
- [Configuración de la API](#-configuración-de-la-api)
- [Scripts](#-scripts)
- [Rutas](#-rutas)
- [Autenticación y permisos](#-autenticación-y-permisos)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Convenciones de código](#-convenciones-de-código)
- [Testing](#-testing)
- [Flujo de trabajo Git](#-flujo-de-trabajo-git)
- [Backend y documentación relacionada](#-backend-y-documentación-relacionada)

## 🧰 Requisitos

- **Node.js 24** y npm (mismo runtime que el backend).
- Angular CLI (`npx ng ...` o instalación global).
- Google Chrome (los tests corren en `ChromeHeadless`).
- Un backend accesible (ver [Configuración de la API](#-configuración-de-la-api)).

## 🚀 Puesta en marcha

```bash
git checkout dev && git pull origin dev
npm install
npm start          # ng serve → http://localhost:4200/
```

El acceso al panel es en `http://localhost:4200/login`; tras iniciar sesión se redirige a `/dashboard`.

## 🔧 Configuración de la API

La URL del backend vive en `src/environments/` y se selecciona con `fileReplacements` de `angular.json`:

| Archivo | Se usa en | `apiUrl` actual |
| --- | --- | --- |
| `environment.development.ts` | `ng serve`, `ng build --configuration development` | `http://127.0.0.1:8000/api` (Django) |
| `environment.production.ts` | `ng build` (producción) | `https://diocesis-backend.onrender.com/api` |

Para desarrollar contra **`diocesis-backend-nest`** en local, cambia `apiUrl` en `environment.development.ts` a `http://localhost:3000/api` (y asegúrate de que `CORS_ORIGINS` del backend incluya `http://localhost:4200`). Los módulos Instituto Bíblico e ISMA **solo existen en el backend NestJS**.

## ⚡ Scripts

| Script | Qué hace |
| --- | --- |
| `npm start` | `ng serve` con recarga en caliente. |
| `npm run build` | Build de producción en `dist/diocesis-frontend-material`. |
| `npm run watch` | Build en modo watch (configuración `development`). |
| `npm test` | Tests con Karma + Jasmine. |

No hay script de lint. El formato se controla con Prettier (`printWidth: 100`, comillas simples, plugin de Tailwind):

```bash
npx prettier --write <archivos>
```

## 🗺️ Rutas

**Públicas** (layout público):

| Ruta | Página |
| --- | --- |
| `/inicio` | Inicio (carrusel y noticias). |
| `/noticias`, `/noticias/:tag` | Búsqueda de noticias, opcionalmente por tag (`diocesis`, `seminario`, `instituto-biblico`...). |
| `/noticia/:id` | Detalle de noticia. |
| `/directorio/padres`, `/directorio/padres/:id` | Directorio de padres. |
| `/directorio/parroquias`, `/directorio/parroquias/:id` | Directorio de parroquias. |
| `/diocesis/instituto-biblico` | Información, capacitaciones, cursos, sedes y calendario. |
| `/diocesis/isma` | Información por secciones, casos especiales y preguntas frecuentes (acordeón). |
| `/login` | Inicio de sesión. |

> Varias entradas del navbar público (Historia, Obispo, Gobierno, Archivo, etc.) son _placeholders_ sin página todavía: cualquier ruta desconocida redirige a `/inicio`.

**Panel** (`/dashboard/...`, protegido por `authGuard`):

| Ruta | Módulo | Acceso |
| --- | --- | --- |
| `users`, `carousel`, `reverends`, `news`, `colonies`, `decants`, `parishes`, `articles`, `documents` | Módulos existentes | Cualquier usuario autenticado (el backend valida el rol). |
| `institute/information`, `trainings`, `courses`, `venues`, `events` | Instituto Bíblico | `moduleAccessGuard('instituto-biblico')` |
| `isma/information`, `special-cases`, `faq` | ISMA | `moduleAccessGuard('isma')` |

## 🔐 Autenticación y permisos

- **Login** (`public/login`): `POST /token/login/` → el `access` se guarda en `localStorage` (`token`). `Auth` (`public/login/services/auth.ts`) expone `user` (signal), `getToken()`, `getUserIdFromToken()` y `loadProfile()`.
- **`authInterceptor`**: añade `Authorization: Bearer <token>` a cada petición.
- **`errorInterceptor`**: ante un `401` **o `403`** cierra la sesión y redirige a `/login`.
- **`authGuard`**: exige token para entrar a `/dashboard`.
- **`moduleAccessGuard(mod)`** (`core/guards/`): `admin`/`super` pasan siempre; un `user` pasa solo si su `moduleAccess` incluye el módulo; si no, redirige a `/dashboard`. Si el perfil aún no está cargado, lo carga antes de decidir.
- **Sidebar admin** (`layouts/admin/layout`): cada entrada puede declarar `requiredModuleAccess`; `items()` oculta los grupos sin acceso. Está cubierto por `layout.spec.ts`.
- La asignación de `moduleAccess` a un usuario se hace en **Usuarios** (casillas por módulo al crear/editar).

> El backend es la fuente de verdad de los permisos: los guards del frontend solo mejoran la experiencia. Como el `errorInterceptor` cierra sesión en `403`, una petición sin permiso expulsa al usuario.

## 📁 Estructura del proyecto

```text
src/
├── environments/                     # apiUrl por ambiente
└── app/
    ├── app.config.ts / app.routes.ts # Providers (zoneless, interceptores, toastr) y rutas
    ├── admin/                        # Una carpeta por pantalla del panel
    │   └── <recurso>/
    │       ├── <recurso>.ts / .html  # Página (tabla + modales, o formulario si es singleton)
    │       └── services/             # Servicio HTTP con signals (lista + total)
    ├── public/                       # Páginas públicas (home, noticias, directorio, institute, isma, login)
    │   └── spike-calendar/           # Prueba técnica del calendario (sin ruta; se conserva como registro)
    ├── layouts/{admin,public}/       # Sidebar del panel y navbar público
    ├── core/
    │   ├── guards/                   # authGuard, moduleAccessGuard
    │   ├── interceptors/             # authInterceptor, errorInterceptor
    │   ├── models/                   # Interfaces del API (Curso, Evento, IsmaInformacion...)
    │   ├── pipes/ services/          # cleanUrl, IconsService
    └── shared/
        ├── components/               # modal, pagination, empty-state, title, role-badge...
        ├── models/common.models.ts   # Tipos de formulario (CourseForm, EventForm...)
        └── utils/                    # createPaginationState, createSearchState...
```

Dos patrones de pantalla admin:

- **Lista con CRUD** (Capacitaciones, Cursos, Sedes, Eventos, Casos especiales, Preguntas frecuentes...): tabla paginada + búsqueda/filtro de estado + modal de alta/edición + confirmación de activar/desactivar. Servicio con `signal` de la lista y del total.
- **Singleton** (Información de Instituto Bíblico / ISMA): un único formulario en la página, sin tabla ni modal (`GET`/`PUT` sin `:id`).

## 📐 Convenciones de código

- Componentes _standalone_ con `OnPush`; sin Reactive Forms ni `ngModel`: `signal` + `(input)` + validación manual.
- Servicios `providedIn: 'root'` con `HttpClient` y `tap` que actualizan signals; paginación `page = offset/limit + 1`, `page_size = limit`.
- Formularios con imagen usan `FormData` (`picture`); el resto envía JSON.
- Los valores vacíos opcionales se envían como `null` (o se omiten en `FormData`).
- Nombres de rutas admin en inglés (`/dashboard/institute/venues`), etiquetas de UI en español.

## 🧪 Testing

```bash
npm test                                             # modo watch con Chrome
npx ng test --watch=false --browsers=ChromeHeadless  # una sola pasada (CI / verificación)
npx ng test --watch=false --browsers=ChromeHeadless --include='**/layout.spec.ts'
```

- El framework es **Jasmine** (`jasmine.createSpy`, `jasmine.createSpyObj`), **no Jest**.
- Los componentes se prueban con `provideZonelessChangeDetection()`; los servicios se sustituyen con `createSpyObj` más una propiedad `signal` cuando el template lee el signal del servicio.
- Si el componente dispara toasts, añade `provideNoopAnimations()` y `provideToastr()` al `TestBed`.
- Hay cobertura de guards (`module-access.guard.spec.ts`), filtro de sidebar por `moduleAccess` (`layout.spec.ts`), páginas singleton, páginas públicas y el _spike_ del calendario. Las pantallas de lista CRUD siguen un patrón común y no tienen spec individual.
- Antes de un PR: `npx tsc --noEmit -p tsconfig.app.json`, `npm run build` y la suite completa en verde.

## 🔀 Flujo de trabajo Git

- **`dev`** es la rama de integración; **`main` no se toca** hasta que se apruebe explícitamente la promoción.
- **Una rama por fase/cambio** desde `dev` (`feat/*`, `fix/*`, `chore/*`, `test/*`, `docs/*`), PR contra `dev` (`gh pr create --base dev`), merge y borrado de la rama.
- Commits en [Conventional Commits](https://www.conventionalcommits.org/) con scope: `feat(isma): ...`, `test(layout): ...`, `docs(readme): ...`.
- Cambios pequeños, verificables y reversibles; una sola cosa por commit.
- Formatea con Prettier los archivos que toques antes de hacer commit.

```bash
git checkout dev && git pull origin dev
git checkout -b feat/mi-cambio
# ... cambios, tsc + build + tests ...
git push -u origin feat/mi-cambio
gh pr create --base dev --head feat/mi-cambio
```

## 🔗 Backend y documentación relacionada

| Repo | Rol |
| --- | --- |
| `diocesis-backend-nest` | API NestJS que consume este frontend (contrato en `docs/contract-matrix.md`). |
| `diocesis-backend-python` | Backend Django en producción; permanece intacto durante la migración. |

Para el diseño y contrato de Instituto Bíblico e ISMA (modelo de datos, endpoints, `moduleAccess`, roadmap), ver `docs/instituto-biblico-isma.md` en `diocesis-backend-nest`.

## 📚 Recursos

- [Angular](https://angular.dev) · [Tailwind CSS](https://tailwindcss.com/docs) · [lucide-angular](https://lucide.dev/guide/packages/lucide-angular) · [FullCalendar](https://fullcalendar.io/docs/angular)
