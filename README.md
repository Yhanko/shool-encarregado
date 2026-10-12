# 👨‍👩‍👧‍👦 Yhanko Educa - Portal do Encarregado (Frontend)

Frontend web SPA do Portal do Encarregado de Educação para o ecossistema educacional **Yhanko Educa**, desenvolvido em **React 18**, **TypeScript**, **Vite**, **Tailwind CSS** e **Radix UI**, containerizado com foco em **alta performance**, **segurança máxima (Non-Root)**, **resiliência de rede** e total compatibilidade com **VPS (Coolify)**, **Docker Compose** e plataformas de nuvem.

---

## 🚀 Arquitetura Docker de Produção

A infraestrutura de container deste projeto foi concebida segundo as melhores práticas da indústria (12-Factor App, CIS Docker Benchmarks):

1. **Multi-Stage Build Otimizado**:
   - `base`: Node.js 22 Alpine (imagem minimalista oficial).
   - `deps`: Instalação idempotente (`npm ci`) com cache BuildKit (`/root/.npm`) e políticas de tolerância a instabilidade de rede.
   - `builder`: Compilação de tipos (`tsc -b`) e bundling com Vite em chunks estáticos de produção.
   - `runner`: Servidor Nginx unprivileged oficial (`nginxinc/nginx-unprivileged:alpine-slim`), sem dependências de desenvolvimento.
2. **Suporte a Variáveis de Ambiente em Runtime**:
   - O script [`docker-entrypoint.sh`](docker-entrypoint.sh) permite alterar `VITE_API_URL` ao iniciar o container sem necessidade de recompilar a imagem Docker, atualizando os bundles compilados dinamicamente.
3. **Portas Dinâmicas (`$PORT`) & VPS/Coolify**:
   - Detecta e configura automaticamente a porta do Nginx quando atribuída por variáveis de ambiente (`PORT`), adaptando-se sem falhas a portas arbitrárias (ex: `3000`, `3004`, `8080`).
4. **Healthcheck Dinâmico e Resiliente**:
   - O script [`docker-healthcheck.sh`](docker-healthcheck.sh) utiliza `curl` e `wget`, identificando a porta ativa da aplicação e fornecendo fallbacks inteligentes para `/healthz` e `/`, prevenindo falhas de `Connection refused` e rollbacks automáticos.
5. **Segurança Endurecida (Hardened & Non-Root)**:
   - Execução restrita sob usuário não-privilegiado `nginx` (`UID 101`).
   - `server_tokens off`: Oculta versões do Nginx.
   - Cabeçalhos de proteção HTTP injetados em todas as respostas (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`).
6. **Performance & Caching Inteligente**:
   - Gzip (nível 6) ativado para textos, JS, CSS, JSON e SVG.
   - Assets compilados do Vite (`/assets/*`) armazenados com cache imutável de 1 ano.
   - `index.html` com `no-store, no-cache` para atualização instantânea em cada deploy.
   - Roteamento SPA configurado (`try_files $uri $uri/ /index.html;`).

---

## 🛠️ Variáveis de Ambiente & Portas

| Variável | Padrão | Descrição |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://school-api-production-a1c6.up.railway.app` | URL base da API backend (suporta injeção em runtime) |
| `PORT` | `3004` (host) / `8080` (container) | Porta em que o Nginx escuta (adaptável dinamicamente) |

---

## 🐳 Executando com Docker

### 1. Usando Docker Compose (Recomendado)

```bash
# Iniciar o container em background com build
docker compose up -d --build

# Visualizar logs em tempo real
docker compose logs -f shool-encarregado

# Checar status e integridade (healthy)
docker compose ps

# Parar serviços
docker compose down
```

Aceder localmente: [http://localhost:3004](http://localhost:3004)  
Verificação de saúde: [http://localhost:3004/healthz](http://localhost:3004/healthz)

---

### 2. Usando Docker CLI

#### Build da Imagem:
```bash
docker build -t yhanko/shool-encarregado:latest .
```

#### Executar Container (com injeção dinâmica de API em runtime):
```bash
docker run -d \
  --name shool-encarregado-frontend \
  -p 3004:8080 \
  -e VITE_API_URL="http://seu-servidor-api:4000" \
  --restart unless-stopped \
  yhanko/shool-encarregado:latest
```

---

## 🌐 Deploy no Coolify (VPS)

1. Crie uma nova aplicação no Coolify apontando para este repositório (`shool-encarregado`).
2. Defina o método de Build como **Dockerfile**.
3. Em **Environment Variables**, adicione (se necessário):
   - `VITE_API_URL=http://seu-backend-url`
4. Em **Ports Exposes**, configure a porta desejada (ex: `3000` ou `8080`).
5. O healthcheck do contêiner responderá com sucesso na primeira tentativa sem conflito de portas ou avisos de curl/wget ausentes.
