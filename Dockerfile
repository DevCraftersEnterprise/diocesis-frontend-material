# Imagen de DESARROLLO LOCAL únicamente (ver
# diocesis-backend-nest/docker-compose.local.yml). No representa cómo se
# construye o sirve el sitio en producción.
FROM node:24-bookworm

WORKDIR /app

# Capa de dependencias cacheada aparte del código fuente.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 4200

# docker-compose.local.yml monta el código como volumen y pasa --host 0.0.0.0
# para que el servidor de Angular sea alcanzable desde fuera del contenedor.
CMD ["npm", "start"]
