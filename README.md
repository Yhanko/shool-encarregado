# Yhanko Educa - Portal do Encarregado (Frontend)

Frontend web SPA desenvolvido em **React 18**, **TypeScript**, **Vite** e **TailwindCSS**, containerizado com foco em **alta performance**, **segurança máxima (Non-Root)**, **resiliência de rede** e **tamanho ultraleve (~31MB)**.

---

## 🚀 Destaques da Arquitetura Docker

1. **Multi-Stage Build Otimizado**:
   - `base`: Node.js 22 Alpine minimalista.
   - `deps`: Instalação de dependências limpa (`npm ci --prefer-offline`) utilizando cache nativo do Docker BuildKit (`--mount=type=cache,target=/root/.npm`) e configurações resilientes de retry para conexões instáveis.
   - `builder`: Compilação de tipos (`tsc -b`) e bundling com Vite em chunks estáticos de produção.
   - `runner`: Servidor Nginx unprivileged oficial (`nginxinc/nginx-unprivileged:alpine-slim`), sem runtime Node ou dependências de desenvolvimento no contêiner final.
2. **Segurança Avançada (Hardened & Non-Root)**:
   - Execução restrita sob usuário não-privilegiado `nginx` (`UID 101`).
   - `server_tokens off`: Previne fingerprinting ocultando versões do Nginx.
   - Cabeçalhos de segurança HTTP injetados em todas as respostas (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`).
3. **Performance & Caching Inteligente**:
   - **Gzip**: Compressão em tempo real ativada para HTML, CSS, JS, JSON e SVG.
   - **Assets com Hash (/assets/*)**: Cache estático imutável por 1 ano (`Cache-Control: public, max-age=31536000, immutable`).
   - **Index HTML (/index.html)**: Cache desativado (`no-store, no-cache, must-revalidate`) para garantir que os clientes recebam imediatamente novos deploys.
   - **SPA Routing**: `try_files $uri $uri/ /index.html;` para suporte perfeito ao React Router em refresh de página.
4. **Healthcheck Nativo**:
   - Endpoint dedicado `/healthz` respondendo `200 healthy` sem poluir logs de acesso.
   - Verificação automática integrada ao Docker daemon (`HEALTHCHECK`).

---

## 🛠️ Comandos Rápidos

### 1. Build da Imagem com Docker

```bash
# Build padrão (usando API de produção configurada)
docker build -t shool-encarregado:latest .

# Build customizando a URL da API backend via ARG
docker build --build-arg VITE_API_URL="https://school-api-production-a1c6.up.railway.app" -t shool-encarregado:latest .
```

### 2. Executar Contêiner com Docker

```bash
docker run -d \
  --name shool-encarregado-frontend \
  -p 3004:8080 \
  --restart unless-stopped \
  shool-encarregado:latest
```

Acesse: `http://localhost:3004`
Verificação de saúde: `http://localhost:3004/healthz`

---

## 🐳 Orquestração com Docker Compose

O arquivo [`docker-compose.yml`](docker-compose.yml) já está pronto para uso com limites de memória/CPU e healthcheck configurados:

```bash
# Iniciar em background com build automático
docker compose up -d --build

# Verificar logs em tempo real
docker compose logs -f shool-encarregado

# Verificar status e integridade do contêiner
docker compose ps

# Parar serviços
docker compose down
```

---

## ⚙️ Variáveis de Ambiente & Build Arguments

| Variável | Padrão | Descrição |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://school-api-production-a1c6.up.railway.app` | URL base da API backend (consumida no build do Vite) |
| `PORT` | `3004` | Porta mapeada no host para a porta interna `8080` do Nginx |
