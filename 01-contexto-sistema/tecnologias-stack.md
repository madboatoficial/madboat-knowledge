# 🔧 Stack Tecnológico MadBoat v3

## Frontend Core

### React 19 + Next.js 15
```json
{
  "react": "^19.0.0",
  "next": "^15.0.0",
  "typescript": "^5.0.0"
}
```

**Principais Features Utilizadas:**
- **React Actions**: Para formulários e mutações de dados
- **Server Components**: Renderização no servidor
- **App Router**: Roteamento baseado em pastas
- **Streaming**: Carregamento progressivo de conteúdo
- **Suspense**: Loading states elegantes

### Estilização e UI
```json
{
  "tailwindcss": "^3.4.0",
  "@tailwindcss/typography": "^0.5.10",
  "framer-motion": "^12.23.12",
  "lucide-react": "^0.400.0"
}
```

**Design System:**
- **Tailwind CSS**: Utilitários para estilização rápida
- **shadcn/ui**: Componentes base personalizáveis
- **Framer Motion**: Animações cinematográficas
- **Lucide Icons**: Conjunto consistente de ícones
- **Custom CSS Variables**: Sistema de cores personalizado

### Gerenciamento de Estado
```json
{
  "zustand": "^5.0.8",
  "@tanstack/react-query": "^5.0.0"
}
```

**Estratégia de Estado:**
- **Zustand**: Estado global simples e performático
- **React Query**: Cache e sincronização de dados servidor
- **Context API**: Estado local de componentes
- **URL State**: Estado na URL para navegação

## Backend e Dados

### Supabase Stack
```json
{
  "@supabase/supabase-js": "^2.56.1",
  "@supabase/auth-ui-react": "^0.4.7",
  "@supabase/auth-ui-shared": "^0.1.8"
}
```

**Serviços Supabase:**
- **PostgreSQL**: Banco relacional principal
- **Auth**: Sistema completo de autenticação
- **Storage**: Armazenamento de arquivos
- **Edge Functions**: Serverless functions
- **Realtime**: Subscriptions em tempo real
- **Row Level Security**: Segurança granular

### Pagamentos e Finanças
```json
{
  "stripe": "^18.5.0",
  "@stripe/stripe-js": "^7.9.0"
}
```

**Integração Stripe:**
- **Payment Intents**: Processamento de pagamentos
- **Subscriptions**: Assinaturas recorrentes
- **Customer Management**: Gerenciamento de clientes
- **Webhooks**: Eventos em tempo real
- **Product Catalog**: Catálogo de produtos

## Ferramentas de Desenvolvimento

### Testing Framework
```json
{
  "vitest": "^3.2.4",
  "@testing-library/react": "^16.3.0",
  "@testing-library/jest-dom": "^6.8.0",
  "@playwright/test": "^1.46.1"
}
```

**Estratégia de Testes:**
- **Vitest**: Testes unitários rápidos
- **React Testing Library**: Testes de componentes
- **Playwright**: Testes E2E
- **Business Logic Tests**: Foco na lógica de negócio
- **Mock Strategy**: Mocks para APIs externas

### Code Quality
```json
{
  "eslint": "^8.0.0",
  "@typescript-eslint/parser": "^6.0.0",
  "prettier": "^3.0.0"
}
```

**Padrões de Qualidade:**
- **ESLint**: Análise estática de código
- **Prettier**: Formatação automática
- **TypeScript Strict**: Modo estrito ativado
- **Husky**: Hooks de pre-commit
- **Lint-staged**: Linting apenas de arquivos modificados

### Build e Bundle
```json
{
  "webpack": "^5.0.0",
  "@next/bundle-analyzer": "^15.0.0",
  "sharp": "^0.33.0"
}
```

**Otimizações:**
- **Next.js Bundle Analyzer**: Análise de bundle
- **Image Optimization**: Otimização automática de imagens
- **Code Splitting**: Divisão inteligente de código
- **Tree Shaking**: Remoção de código não utilizado
- **Minification**: Minificação automática

## Utilitários e Helpers

### Data Manipulation
```json
{
  "lodash-es": "^4.17.21",
  "date-fns": "^3.0.0",
  "zod": "^3.22.0"
}
```

**Funcionalidades:**
- **Lodash-es**: Utilitários para arrays, objetos e funções
- **Date-fns**: Manipulação de datas
- **Zod**: Validação e parsing de dados
- **Class Variance Authority**: Variantes de CSS condicionais

### Visualization e UI Advanced
```json
{
  "@visx/group": "^3.12.0",
  "@visx/hierarchy": "^3.12.0",
  "@visx/shape": "^3.12.0",
  "react-window": "^2.1.0"
}
```

**Componentes Avançados:**
- **Visx**: Visualizações de dados
- **React Window**: Virtualização para listas grandes
- **React Infinite Scroll**: Scroll infinito performático
- **Framer Motion**: Animações complexas

## DevOps e Deploy

### GitHub Actions
```yaml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    - Type checking
    - Unit tests
    - E2E tests
    - Lint verification
  build:
    - Build all workspaces
    - Bundle analysis
    - Performance audit
  deploy:
    - Supabase migrations
    - Vercel deployment
    - Environment sync
```

### Environment Management
```bash
# Development
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Database
DATABASE_URL=
DIRECT_URL=
```

## Performance e Monitoring

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTFB (Time to First Byte)**: < 600ms

### Bundle Size Targets
- **Initial Bundle**: < 100KB gzipped
- **Route Chunks**: < 50KB gzipped
- **Vendor Chunks**: < 200KB gzipped
- **Asset Optimization**: WebP/AVIF para imagens

### Memory Management
- **React DevTools Profiler**: Análise de renders
- **Memory Leaks Detection**: Detecção de vazamentos
- **Component Optimization**: Memoização estratégica
- **Bundle Splitting**: Divisão otimizada

## Compatibilidade e Suporte

### Browsers Suportados
```json
{
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead",
    "not ie 11"
  ]
}
```

### Node.js Requirements
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### Platform Support
- **Web**: Chrome, Firefox, Safari, Edge
- **Mobile**: Progressive Web App (PWA)
- **Desktop**: Electron wrapper (futuro)
- **API**: RESTful + GraphQL (Supabase)

## Scripts Personalizados

### Development Workflow
```bash
# Desenvolvimento
npm run dev              # Start web app
npm run dev:web         # Start web specifically
npm run dev:admin       # Start admin panel

# Build e Deploy
npm run build           # Build all workspaces
npm run mb-check        # Health check completo
npm run mb-types        # Generate Supabase types

# Testing
npm run test            # Vitest
npm run test:e2e        # Playwright
npm run test:coverage   # Coverage report
```

### MadBoat Custom Commands
```bash
# Agent System
.madboat/bin/agent poseidon      # Database specialist
.madboat/bin/agent mandarin-fish # UI specialist
.madboat/bin/agent kraken        # Master orchestrator
.madboat/bin/activate-kraken     # Activate in terminal

# TypeScript
npm run mb-strict       # Enable strict mode
npm run mb-migrate      # Migrate legacy code
npm run mb-audit        # Type safety audit
```

## Arquitetura de Dados

### Database Schema
```sql
-- Core Tables
auth.users              -- Supabase Auth users
public.profiles         -- User profiles
public.personas         -- User personas/roles
public.timeline_events  -- User journey events

-- Business Logic
public.stories          -- User stories/content
public.business_types   -- Business classifications
public.subscriptions    -- Stripe subscriptions
public.payments         -- Payment history
```

### API Routes Structure
```
/api/auth/              # Authentication endpoints
/api/stripe/            # Payment processing
/api/supabase/          # Database operations
/api/webhooks/          # External webhooks
/api/edge/              # Edge functions
```

## Security Implementation

### Authentication Flow
```typescript
// Supabase Auth with Next.js
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${location.origin}/auth/callback`
  }
})
```

### Data Protection
```typescript
// Row Level Security Policy
CREATE POLICY "Users can only access own data"
ON profiles FOR ALL
USING (auth.uid() = user_id);

// TypeScript Type Safety
interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
```

## Deployment Strategy

### Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "apps/web/.next",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1"],
  "functions": {
    "apps/web/src/app/**": {
      "maxDuration": 30
    }
  }
}
```

### Supabase Configuration
```toml
[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]

[db]
port = 54322
major_version = 15

[studio]
enabled = true
port = 54323

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://madboat.vercel.app"]
```