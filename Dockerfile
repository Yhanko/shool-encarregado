# ==============================================================================
# Dockerfile - Yhanko Educa (Portal do Encarregado - Frontend)
# Multi-stage, performático, seguro e minimalista (Vite + React + Nginx Unprivileged)
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Base Stage: Node.js runtime oficial minimalista (Alpine Linux)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS base

WORKDIR /app

# ------------------------------------------------------------------------------
# 2. Dependencies Stage: Instalação rápida das dependências com cache eficiente
# ------------------------------------------------------------------------------
FROM base AS deps

# Copia apenas os manifestos primeiro para aproveitar o cache de camadas do Docker
COPY package.json package-lock.json ./

# Configura resiliência de rede no npm e instala dependências com cache do buildkit
RUN --mount=type=cache,target=/root/.npm \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci --prefer-offline --no-audit

# ------------------------------------------------------------------------------
# 3. Builder Stage: Compilação dos assets estáticos via Vite
# ------------------------------------------------------------------------------
FROM base AS builder

WORKDIR /app

# Copia os módulos instalados no estágio anterior
COPY --from=deps /app/node_modules ./node_modules

# Copia o código-fonte da aplicação
COPY . .

# Argumentos de Build para variáveis de ambiente públicas do Vite (VITE_*)
ARG VITE_API_URL=https://school-api-production-a1c6.up.railway.app
ENV VITE_API_URL=$VITE_API_URL

# Executa a compilação do TypeScript e bundling do Vite para produção
RUN npm run build

# ------------------------------------------------------------------------------
# 4. Runner Stage: Servidor Web Nginx seguro e sem privilégios (Non-Root)
# ------------------------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:alpine-slim AS runner

# Metadados OCI da imagem
LABEL maintainer="Yhanko Tech" \
      project="shool-encarregado" \
      description="Yhanko Educa Portal do Encarregado - Frontend de Alta Performance"

# Copia a configuração endurecida e customizada do Nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos compilados do estágio builder para o diretório raiz do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Porta não-privilegiada do container
EXPOSE 8080

# Verificação de integridade e saúde da aplicação (Healthcheck nativo e leve com wget)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

# Inicializa o Nginx em foreground (executando como usuário não-root UID 101 'nginx')
CMD ["nginx", "-g", "daemon off;"]
