# 🏗️ Arquitetura Técnica MadBoat v3

## Estrutura Monorepo

```
madboat-v3/
├── apps/
│   ├── web/                 # Next.js 15 App
│   └── marketing/           # Landing page
├── packages/
│   ├── ui/                  # Componentes compartilhados
│   ├── core/                # Lógica de negócio
│   ├── database/            # Tipos e queries Supabase
│   └── config/              # Configurações compartilhadas
├── supabase/
│   ├── migrations/          # Database migrations
│   └── functions/           # Edge Functions
└── .madboat/                # Sistema de agentes
```

## Stack Tecnológico Detalhado

### Frontend
- **Framework**: Next.js 15.0.3 (App Router)
- **React**: 19.0.0 RC (Actions + Suspense)
- **Styling**: Tailwind CSS + Framer Motion
- **State**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **UI Library**: Radix UI + Shadcn/ui

### Backend
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth (OAuth + Magic Links)
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime
- **Functions**: Edge Functions (Deno)
- **API**: tRPC + Server Actions

### Infraestrutura
- **Deploy Web**: Vercel
- **Database**: Supabase Cloud
- **CDN**: Vercel Edge Network
- **Monitoring**: Sentry + PostHog
- **CI/CD**: GitHub Actions

## Arquitetura de Dados

### Fluxo Principal
```
Cliente (React)
    ↓
Server Actions / tRPC
    ↓
Supabase Client
    ↓
PostgreSQL + RLS
    ↓
Row Level Security
```

### Camadas de Segurança
1. **Frontend Validation**: Zod schemas
2. **Server Validation**: Server Actions
3. **Database RLS**: Row Level Security
4. **API Rate Limiting**: Vercel Edge
5. **Auth Tokens**: JWT + Refresh

## Sistema de Packages

### @madboat/ui
- Componentes React reutilizáveis
- Design system tokens
- Animações padronizadas
- Hooks customizados

### @madboat/core
- Business logic pura
- Validações compartilhadas
- Utilitários
- Tipos TypeScript

### @madboat/database
- Tipos gerados do Supabase
- Queries preparadas
- Migrations helpers
- RLS policies

## Padrões de Código

### TypeScript Strict Mode
```typescript
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true
}
```

### Estrutura de Componentes
```typescript
// Padrão para componentes
components/
├── ComponentName/
│   ├── index.tsx
│   ├── ComponentName.tsx
│   ├── ComponentName.types.ts
│   ├── ComponentName.styles.ts
│   └── ComponentName.test.ts
```

## Performance Optimizations

### Web Vitals Target
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **TTI**: < 3.8s

### Estratégias
1. **Code Splitting**: Dynamic imports
2. **Image Optimization**: Next/Image
3. **Font Loading**: next/font
4. **Caching**: ISR + SWR
5. **Bundle Size**: Tree shaking

## Sistema de Agentes

### Arquitetura Multi-Agente
```
KRAKEN (Orchestrator)
    ├── Mandarin Fish (UI)
    ├── Poseidon (Database)
    ├── Uncle McDuck (Finance)
    ├── Ulisses (Docs)
    ├── Thaumoctopus (Git)
    ├── Oyster (RLVR)
    └── UNI (Meta)
```

### Comunicação Inter-Agentes
- **Protocol**: YAML-based messaging
- **State**: Shared context files
- **Sync**: Git-based coordination
- **Logs**: Structured JSON

## Ambientes

### Development
```bash
npm run dev
# http://localhost:3000
```

### Staging
```bash
npm run build:staging
# https://staging.madboat.app
```

### Production
```bash
npm run build:prod
# https://madboat.app
```

## Monitoramento

### Métricas Tracked
- User engagement
- Modal completion rates
- API response times
- Error rates
- Conversion funnels

### Alertas Configurados
- Database connection issues
- Payment failures
- High error rates
- Performance degradation
- Security anomalies

---

*Arquitetura otimizada para escala e manutenibilidade*