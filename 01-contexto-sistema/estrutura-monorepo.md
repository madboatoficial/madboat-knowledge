# 🏗️ Estrutura do Monorepo MadBoat v3

## Visão Geral da Arquitetura

O MadBoat v3 utiliza uma arquitetura de monorepo baseada em **npm workspaces** que separa responsabilidades seguindo o conceito dos "3 Mundos": UI, Core e API.

```
madboat-v3/
├── 📱 apps/                    # Aplicações principais
├── 📦 packages/               # Pacotes compartilhados
├── 🗄️ supabase/               # Backend e banco de dados
├── 🐙 .madboat/               # Sistema de agentes IA
├── 🧭 .kraken/                # Orquestração e contexto
├── 📚 conhecimento-claude/    # Base de conhecimento
├── 🔧 .github/                # CI/CD e workflows
└── 📋 docs/                   # Documentação técnica
```

## Apps Directory (Aplicações)

### 🌐 apps/web/ - Aplicação Web Principal
```
apps/web/
├── src/
│   ├── app/                   # Next.js 15 App Router
│   │   ├── (auth)/           # Grupo de rotas autenticadas
│   │   ├── auth/             # Páginas de autenticação
│   │   ├── control/          # Painel de controle principal
│   │   ├── api/              # API Routes do Next.js
│   │   ├── globals.css       # Estilos globais
│   │   ├── layout.tsx        # Layout raiz
│   │   └── page.tsx          # Página inicial
│   ├── components/           # Componentes React
│   │   ├── ui/               # Componentes base (shadcn/ui)
│   │   ├── modals/           # Sistema de modals
│   │   │   ├── ModalRenderer.tsx
│   │   │   ├── GameModalContext.tsx
│   │   │   └── content/      # Conteúdo específico dos modals
│   │   ├── auth/             # Componentes de autenticação
│   │   ├── forms/            # Formulários reutilizáveis
│   │   └── layout/           # Componentes de layout
│   ├── hooks/                # Hooks customizados
│   │   ├── use-auth-state.ts
│   │   ├── useModalSystem.ts
│   │   └── use-supabase.ts
│   ├── lib/                  # Utilitários e configurações
│   │   ├── utils.ts          # Funções utilitárias
│   │   ├── supabase.ts       # Cliente Supabase
│   │   ├── stripe.ts         # Cliente Stripe
│   │   └── validations.ts    # Schemas de validação
│   ├── actions/              # React 19 Actions
│   │   ├── auth-actions.ts   # Ações de autenticação
│   │   ├── module-actions.ts # Ações de módulos
│   │   └── hexagon-actions.ts # Ações do sistema hexagonal
│   ├── systems/              # Sistemas complexos
│   │   ├── modal-system.ts   # Sistema de modals
│   │   ├── modal-registry.ts # Registro de modals
│   │   └── modal-definitions.ts # Definições de modals
│   ├── types/                # Definições de tipos
│   │   ├── modal.types.ts    # Tipos do sistema de modals
│   │   ├── persona.ts        # Tipos de personas
│   │   └── supabase.ts       # Tipos do Supabase
│   └── __tests__/            # Testes
│       ├── components/       # Testes de componentes
│       ├── hooks/            # Testes de hooks
│       └── utils/            # Testes de utilitários
├── public/                   # Assets estáticos
│   ├── images/               # Imagens
│   ├── icons/                # Ícones
│   └── fonts/                # Fontes customizadas
├── package.json              # Dependências da aplicação web
├── next.config.js            # Configuração do Next.js
├── tailwind.config.js        # Configuração do Tailwind
└── tsconfig.json             # Configuração TypeScript
```

**Características principais:**
- **Next.js 15** com App Router
- **React 19** com Actions e Suspense
- **TypeScript Strict Mode** ativado
- **Sistema de Modal** gamificado
- **Autenticação** via Supabase Auth
- **Pagamentos** via Stripe

### 🔒 apps/admin/ - Painel Administrativo
```
apps/admin/
├── src/
│   ├── app/                  # Admin routes
│   ├── components/           # Admin components
│   ├── lib/                  # Admin utilities
│   └── types/                # Admin types
├── package.json
└── next.config.js
```

**Funcionalidades:**
- **Dashboard** de métricas
- **Gerenciamento** de usuários
- **Analytics** de uso
- **Configurações** do sistema

### 📱 apps/mobile/ - Aplicação Mobile (Futuro)
```
apps/mobile/
├── src/
├── package.json
└── expo.config.js
```

**Planejado para:**
- **React Native** com Expo
- **Shared Logic** com apps/web
- **Native Features** específicas

## Packages Directory (Pacotes Compartilhados)

### 🎨 packages/ui/ - Componentes UI Compartilhados
```
packages/ui/
├── src/
│   ├── components/           # Componentes reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   └── index.ts
│   ├── hooks/                # Hooks de UI
│   ├── utils/                # Utilitários de UI
│   └── styles/               # Estilos compartilhados
├── package.json
└── tsconfig.json
```

### 🧠 packages/core/ - Lógica de Negócio
```
packages/core/
├── src/
│   ├── services/             # Serviços de negócio
│   ├── utils/                # Utilitários core
│   ├── types/                # Tipos compartilhados
│   ├── constants/            # Constantes
│   └── validations/          # Validações Zod
├── package.json
└── tsconfig.json
```

### ⚙️ packages/config/ - Configurações Compartilhadas
```
packages/config/
├── eslint/                   # Configurações ESLint
├── typescript/               # Configurações TypeScript
├── tailwind/                 # Configuração Tailwind
├── prettier/                 # Configuração Prettier
└── vitest/                   # Configuração Vitest
```

## Supabase Directory (Backend)

### 🗄️ supabase/ - Configuração do Backend
```
supabase/
├── migrations/               # Migrações do banco
│   ├── 001_create_authentication_tables.sql
│   ├── 002_cleanup_and_create_admin.sql
│   ├── 003_create_timeline_events_system.sql
│   ├── 004_create_test_user_timeline_demo.sql
│   └── 005_create_persona_system.sql
├── functions/                # Edge Functions
│   ├── stripe-webhook/       # Webhook do Stripe
│   └── user-stats/           # Estatísticas do usuário
├── seed.sql                  # Dados iniciais
├── config.toml               # Configuração do Supabase
└── .env.example              # Variáveis de ambiente
```

**Schema Principal:**
```sql
-- Tabelas principais
profiles                 -- Perfis dos usuários
personas                 -- Personas/roles do sistema
timeline_events         -- Eventos da jornada do usuário
stories                 -- Histórias enviadas pelos usuários
business_types          -- Tipos de negócio
subscriptions           -- Assinaturas do Stripe
```

## Sistema de Agentes (.madboat/)

### 🐙 .madboat/ - Inteligência Artificial Distribuída
```
.madboat/
├── agents/                   # Agentes especializados
│   ├── kraken/              # 🐙 Orquestrador master
│   ├── mandarin-fish/       # 🐠 Especialista UI/UX
│   ├── poseidon/            # 🔱 Especialista banco de dados
│   ├── uncle-mcduck/        # 💰 Consultor financeiro
│   ├── ulisses/             # 📖 Cronista
│   ├── thaumoctopus/        # 🐙 Mestre Git
│   ├── oyster/              # 🦪 Constructor RLVR
│   └── uni/                 # 🦄 Meta-orquestrador
├── bin/                     # Scripts executáveis
│   ├── agent                # Lançador de agentes
│   ├── activate-kraken      # Ativador do Kraken
│   └── status               # Status do sistema
├── shared/                  # Contexto compartilhado
│   ├── knowledge/           # Base de conhecimento
│   ├── status/              # Status dos agentes
│   └── protocols/           # Protocolos de comunicação
└── consciousness/           # Consciência coletiva
    └── REVOLUTIONARY_PHASE_NOTIFICATION.md
```

## Coordenação (.kraken/)

### 🧭 .kraken/ - Coordenação e Contexto
```
.kraken/
├── context.yaml             # Contexto principal (CRÍTICO)
├── user-journey.yaml        # Jornada do usuário
├── modal_system_phase2_spec.md
└── mandarin_fish_modal_briefing.md
```

**Regras críticas:**
- **SEMPRE** salvar contexto em `context.yaml`
- **NUNCA** criar arquivos separados de contexto
- **SEMPRE** atualizar após trabalho importante

## Base de Conhecimento (conhecimento-claude/)

### 📚 conhecimento-claude/ - Claude Code Integration
```
conhecimento-claude/
├── 01-contexto-sistema/     # Contexto e arquitetura
├── 02-agentes/              # Documentação dos agentes
├── 03-jornada-usuario/      # Jornada e UX
├── 04-regras-negocio/       # Regras de negócio
├── 05-padroes-codigo/       # Padrões de desenvolvimento
├── 06-design-system/        # Sistema de design
├── 07-banco-dados/          # Esquemas e migrações
├── 08-integracoes/          # Integrações externas
├── 09-estado-atual/         # Estado atual do desenvolvimento
└── 10-instrucoes-especiais/ # Instruções especiais
```

## CI/CD e DevOps (.github/)

### 🔧 .github/ - Workflows e Automação
```
.github/
├── workflows/               # GitHub Actions
│   ├── ci.yml              # Integração contínua
│   ├── deploy.yml          # Deploy automático
│   ├── knowledge-update.yml # Atualização da base de conhecimento
│   └── agent-sync.yml      # Sincronização de agentes
├── ISSUE_TEMPLATE/         # Templates de issues
├── PULL_REQUEST_TEMPLATE/  # Template de PR
├── branch-naming.md        # Convenções de branch
└── CODEOWNERS             # Proprietários de código
```

## Scripts e Automação

### 📋 Scripts Principais
```json
{
  "scripts": {
    "dev": "npm run dev --workspace=apps/web",
    "build": "npm run build --workspaces",
    "test": "vitest",
    "type-check": "npm run type-check --workspaces",
    "mb-check": "npm run type-check && npm run test:run",
    "mb-types": "node scripts/generate-types.js",
    "mb-strict": "echo 'TypeScript Strict Mode: Enabled'"
  }
}
```

### 🤖 Scripts de Agentes
```bash
#!/bin/bash
# .madboat/bin/agent
case $1 in
  "poseidon") echo "🔱 Launching Poseidon..." ;;
  "mandarin-fish") echo "🐠 Launching Mandarin Fish..." ;;
  "kraken") echo "🐙 Launching Kraken..." ;;
  "status") cat .madboat/shared/status/agents.json ;;
esac
```

## Configuração de Workspaces

### 📦 package.json (Root)
```json
{
  "name": "madboat-ecosystem",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspace=apps/web",
    "build": "npm run build --workspaces",
    "test": "vitest",
    "type-check": "npm run type-check --workspaces"
  }
}
```

### 🔗 Dependency Management
```bash
# Instalar dependência em workspace específico
npm install lodash --workspace=apps/web

# Instalar dependência em todos os workspaces
npm install typescript --workspaces

# Instalar dependência shared
npm install @madboat/ui --workspace=apps/admin
```

## Padrões de Importação

### 📥 Import Patterns
```typescript
// Imports de workspace para workspace
import { Button } from '@madboat/ui'
import { validateUser } from '@madboat/core'

// Imports internos relativos
import { Modal } from '@/components/ui'
import { useAuth } from '@/hooks/use-auth'

// Imports de tipos
import type { User } from '@/types/supabase'
import type { ModalProps } from '@madboat/ui'
```

## Estratégia de Versionamento

### 📌 Semantic Versioning
```json
{
  "version": "2.0.0",
  "workspaces": {
    "apps/web": "2.0.0",
    "packages/ui": "1.5.2",
    "packages/core": "1.3.1"
  }
}
```

### 🏷️ Git Branching Strategy
```
main                    # Produção estável
├── develop             # Desenvolvimento principal
├── feature/MAD-XX-*    # Features específicas
├── agent/MAD-XX-*      # Trabalho de agentes
└── hotfix/MAD-XX-*     # Correções urgentes
```

## Deployment Strategy

### 🚀 Multi-Environment Deploy
```yaml
# Vercel Configuration
builds:
  - src: "apps/web/package.json"
    use: "@vercel/next"
    config:
      outputDirectory: ".next"

# Supabase Configuration
environments:
  - name: "production"
    ref: "main"
  - name: "staging"
    ref: "develop"
```

### 🔄 Automated Workflows
1. **Push to feature branch** → Run CI tests
2. **PR to develop** → Full test suite + preview deploy
3. **Merge to develop** → Deploy to staging
4. **PR to main** → Production deploy
5. **Agent work** → Auto-sync knowledge base

## Performance Optimization

### ⚡ Build Optimization
- **Incremental Builds**: Apenas workspaces modificados
- **Shared Dependencies**: Hoisting inteligente
- **Cache Strategy**: Cache de node_modules e builds
- **Parallel Execution**: Builds em paralelo

### 📊 Bundle Analysis
```bash
# Análise de bundle por workspace
npm run build:analyze --workspace=apps/web

# Análise global do monorepo
npm run analyze:all
```

Esta estrutura de monorepo garante:
- **Separação clara** de responsabilidades
- **Reutilização** eficiente de código
- **Manutenibilidade** alta
- **Escalabilidade** horizontal
- **Integração** contínua robusta