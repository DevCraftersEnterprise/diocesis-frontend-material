# AGENTS.md — diocesis-frontend-material

Guía de flujo de trabajo para cualquier agente (o persona) que haga cambios en este
repo. Para convenciones de código Angular/TypeScript, ver
[`.github/copilot-instructions.md`](.github/copilot-instructions.md).

## Flujo de ramas y PRs

1. **Nunca se trabaja directo sobre `main` ni `dev`.** Cada tarea va en su propia
   rama, creada desde `origin/dev` actualizado.
2. Nombre de rama: `tipo/descripcion-corta` en español/inglés mixto está bien
   (`fix/colonias-selector-pagina-completa`, `feat/paginas-en-construccion`,
   `style/isma-tarjetas-independientes`, `chore/upgrade-angular`).
3. Antes de abrir el PR:
   - `npx ng test --watch=false --browsers=ChromeHeadless` (toda la suite, no solo
     los specs tocados, al menos una vez antes de empujar).
   - `npm run build` (debe compilar sin errores; limpiar `dist/` después).
4. El PR va contra `dev`, nunca contra `main` directamente.
5. **El merge del PR a `dev` requiere aprobación explícita del usuario.** No se
   fusiona solo porque los checks pasen.
6. La promoción `dev → main` es un paso aparte y **solo se hace cuando el usuario
   la pide explícitamente** ("haz la promoción", "promueve a main"), nunca junto
   con el merge a `dev` por defecto.
7. Después de promover, verificar el despliegue (ver abajo) antes de dar la tarea
   por terminada.
8. **Borrar ramas ya fusionadas solo cuando el usuario lo pide** (local y remoto).
   Antes de borrar, confirmar con `git merge-base --is-ancestor <rama> origin/dev`
   que de verdad está fusionada — nunca borrar una rama con commits propios sin
   fusionar (p. ej. `backup/old-ui`, `chore/docker-local-dev` llevan meses así a
   propósito).

Mensajes de commit y cuerpos de PR en español, describiendo la causa del problema
cuando es un fix, no solo el síntoma.

## Despliegue

`main` se despliega solo a Hostinger vía GitHub Actions
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)): build de
producción + `ng test` en CI + FTP a `/public_html/`. Después de promover a `main`,
confirmar con `gh run list` que el workflow `Deploy Angular to Hostinger` terminó en
`success` antes de reportar la tarea como hecha.

`index.html` y `version.json` se sirven con `Cache-Control: no-cache` (ver
`public/.htaccess`) para que cada visita pida la versión publicada. Como es una SPA,
una pestaña abierta desde antes de un deploy no se entera sola — `VersionCheckService`
(`src/app/core/services/version-check.service.ts`) avisa para recargar cuando detecta
una versión nueva.

## Git en Windows

Si `git push`/`git commit` falla con errores de escritura en `.git/objects` ("fsync
error", "unable to create temporary file"), es un problema de disco local conocido en
esta máquina, no del repo. Workaround: crear la rama y subir los archivos con la API
de GitHub (`gh api -X POST .../git/refs`, `gh api -X PUT .../contents/...`) en vez de
`git push`, o simplemente reintentar el push una vez.

## Comandos

```bash
npm install
npm start                  # ng serve
npx ng test --watch=false --browsers=ChromeHeadless
npm run build
```

## Qué NO hacer sin que el usuario lo pida explícitamente

- Push directo a `main` o `dev`.
- Merge de un PR.
- Promoción `dev → main`.
- Borrar ramas, aunque estén fusionadas.
- Cambiar contenido de producción vía API (p. ej. campos editables desde el panel
  admin) en vez de que lo capture un administrador — solo si el usuario lo pide
  explícitamente y confirma el texto exacto.
