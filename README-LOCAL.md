# Configuração Local - Visalytica

Este projeto foi configurado para rodar completamente no localhost, sem dependências externas.

## 🚀 Configuração Rápida

1. **Instalar dependências:**
```bash
yarn install
```

2. **Configurar ambiente local:**
```bash
yarn setup:local
```

3. **Iniciar banco PostgreSQL (Docker):**
```bash
yarn db:start
```

4. **Iniciar o servidor:**
```bash
yarn start:dev
```

## 📁 Estrutura Local

- **Banco de dados:** PostgreSQL via Docker
- **Imagens:** Pasta local (`./uploads/`)
- **Servidor:** http://localhost:3001
- **API Docs:** http://localhost:3001/api

## 🔧 Configurações

### Banco de Dados
- Tipo: PostgreSQL
- URL: `postgresql://postgres:postgres@localhost:5432/visalytica_local`
- Sincronização: Habilitada (tabelas criadas automaticamente)

### Armazenamento de Imagens
- Local: `./uploads/`
- Acesso: http://localhost:3001/uploads/[nome-do-arquivo]
- Formato: UUID + extensão original

### Variáveis de Ambiente (.env)
```env
# Banco de dados PostgreSQL local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/visalytica_local

# JWT
JWT_EXPIRATION=1d
JWT_SECRET=SEU_SEGREDO_SUPER_SECRETO_E_LONGO

# Armazenamento local de arquivos
UPLOADS_PATH=./uploads
BASE_URL=http://localhost:3001
```

## 📋 Scripts Disponíveis

```bash
# Desenvolvimento
yarn start:dev

# Produção
yarn build
yarn start:prod

# Configuração inicial
yarn setup:local

# Banco de dados
yarn db:start    # Iniciar PostgreSQL
yarn db:stop     # Parar PostgreSQL
yarn db:logs     # Ver logs do banco

# Seed do banco
yarn seed

# Testes
yarn test
```

## 🗂️ Estrutura de Arquivos

```
nest_visalityca/
├── uploads/           # Imagens salvas localmente
├── docker-compose.yml # PostgreSQL via Docker
├── src/
│   ├── files/
│   │   └── local-files.service.ts  # Serviço de arquivos local
│   └── ...
└── scripts/
    └── setup-local.js # Script de configuração
```

## ✅ Vantagens da Configuração Local

- ✅ Sem dependências de serviços externos (AWS S3)
- ✅ PostgreSQL local (mesmo tipo de produção)
- ✅ Desenvolvimento offline
- ✅ Configuração simples e rápida
- ✅ Dados persistentes localmente

## 🚨 Pré-requisitos

- Docker e Docker Compose instalados
- A pasta `uploads/` está no `.gitignore`

### Instalação Docker:
- Windows: https://docs.docker.com/desktop/windows/
- Mac: https://docs.docker.com/desktop/mac/
- Linux: https://docs.docker.com/engine/install/

## 🔄 Migração de Dados

Se você tinha dados em produção e quer migrar para local:

1. Exporte os dados do banco PostgreSQL
2. Use o seed ou importe manualmente
3. Baixe as imagens do S3 para a pasta `./uploads/`