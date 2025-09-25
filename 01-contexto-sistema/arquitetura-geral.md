# 🐙 MadBoat v3 - Arquitetura Geral do Sistema

## Visão Geral
MadBoat v3 é uma plataforma inovadora baseada no conceito dos "3 Mundos" que utiliza React 19, Next.js 15 e uma arquitetura de monorepo para criar uma experiência gamificada de descoberta pessoal e profissional na era da IA.

## Arquitetura dos 3 Mundos

### 1. Mundo UI (Interface de Usuário)
- **Framework**: React 19 + Next.js 15
- **Estilização**: Tailwind CSS com sistema de design personalizado
- **Animações**: Framer Motion para transições cinematográficas
- **Componentes**: shadcn/ui como base do design system
- **Estado Global**: Zustand para gerenciamento de estado
- **Portal System**: Sistema de modais baseado em React Portal

### 2. Mundo Core (Lógica de Negócio)
- **TypeScript Strict Mode**: Ativado em todos os workspaces
- **Validação**: Zod para validação de dados
- **Utilitários**: Lodash-es para manipulação de dados
- **Testing**: Vitest com React Testing Library
- **Business Logic**: Separada em actions e hooks customizados

### 3. Mundo API (Dados e Integrações)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Pagamentos**: Stripe para processamento de pagamentos
- **Tempo Real**: Supabase Realtime para atualizações em tempo real
- **Autenticação**: Supabase Auth com OAuth providers
- **Migrações**: Sistema versionado de migrações SQL

## Estrutura de Monorepo

```
madboat-v3/
├── apps/                    # Aplicações principais
│   ├── web/                # App web principal (Next.js)
│   ├── admin/              # Painel administrativo
│   └── mobile/             # App mobile (futuro)
├── packages/               # Pacotes compartilhados
│   ├── ui/                 # Componentes UI reutilizáveis
│   ├── core/               # Lógica de negócio compartilhada
│   └── config/             # Configurações compartilhadas
├── supabase/               # Configuração e migrações do banco
├── .madboat/               # Sistema de agentes especializados
├── .kraken/                # Coordenação e contexto
└── conhecimento-claude/    # Base de conhecimento para Claude
```

## Tecnologias Principais

### Frontend Stack
- **React 19**: Aproveitando Actions e novas funcionalidades
- **Next.js 15**: App Router com Server Components
- **TypeScript 5.0+**: Strict mode habilitado
- **Tailwind CSS**: Estilização utilitária
- **Framer Motion 12**: Animações profissionais
- **Lucide React**: Ícones consistentes

### Backend Stack
- **Supabase**: BaaS completo (PostgreSQL + Auth + Storage + Edge Functions)
- **PostgreSQL**: Banco relacional robusto
- **Row Level Security (RLS)**: Segurança granular de dados
- **Stripe**: Processamento de pagamentos e assinaturas
- **Edge Functions**: Computação serverless

### Ferramentas de Desenvolvimento
- **Vitest**: Framework de testes rápido
- **Playwright**: Testes E2E
- **ESLint + Prettier**: Linting e formatação
- **Storybook**: Desenvolvimento isolado de componentes
- **npm workspaces**: Gerenciamento de monorepo

## Padrões Arquiteturais

### 1. Separation of Concerns
- **UI Components**: Apenas apresentação e interação
- **Business Logic**: Isolada em hooks e actions
- **Data Layer**: Abstraída através de clients e services

### 2. Type Safety
- **Strict TypeScript**: Zero tolerância a tipos `any`
- **Supabase Types**: Geração automática de tipos do schema
- **Zod Schemas**: Validação runtime com inferência de tipos
- **Generic Patterns**: Reutilização através de generics

### 3. Performance
- **Code Splitting**: Lazy loading de componentes e rotas
- **Server Components**: Renderização no servidor quando apropriado
- **Otimização de Bundle**: Tree shaking e minificação
- **Caching Strategy**: Cache inteligente de dados e assets

### 4. Scalability
- **Modular Architecture**: Fácil adição de novos módulos
- **Plugin System**: Extensibilidade através de plugins
- **Microservices Ready**: Preparado para divisão em serviços
- **Database Scaling**: Suporte a read replicas e sharding

## Sistema de Agentes Especializados

MadBoat utiliza 8 agentes especializados coordenados pelo sistema Kraken:

1. **🐙 Kraken**: Orquestrador master
2. **🐠 Mandarin Fish**: Especialista em UI/UX
3. **🔱 Poseidon**: Especialista em banco de dados
4. **💰 Uncle McDuck**: Consultor financeiro e Stripe
5. **📖 Ulisses**: Cronista e documentação
6. **🐙 Thaumoctopus**: Mestre Git e versionamento
7. **🦪 Oyster**: Constructor supremo RLVR
8. **🦄 UNI**: Meta-orquestrador

## Princípios de Design

### 1. User-Centric Design
- **Progressive Disclosure**: Informações reveladas progressivamente
- **Gamification**: Sistema de recompensas e conquistas
- **Accessibility**: Suporte completo a WCAG 2.1
- **Responsive**: Design mobile-first

### 2. Performance-First
- **60fps Animations**: Animações suaves e performáticas
- **Lazy Loading**: Carregamento sob demanda
- **Bundle Optimization**: Otimização automática de bundles
- **CDN Strategy**: Distribuição global de assets

### 3. Developer Experience
- **Type Safety**: TypeScript strict em todo o codebase
- **Hot Reload**: Desenvolvimento com recarregamento instantâneo
- **Error Boundaries**: Tratamento gracioso de erros
- **Development Tools**: Ferramentas robustas de debug

## Segurança

### 1. Autenticação e Autorização
- **OAuth Integration**: Login social seguro
- **JWT Tokens**: Tokens seguros com refresh automático
- **Role-Based Access**: Controle granular de permissões
- **Session Management**: Gerenciamento seguro de sessões

### 2. Data Protection
- **Row Level Security**: Políticas de segurança a nível de linha
- **Data Encryption**: Criptografia em trânsito e em repouso
- **Input Validation**: Validação rigorosa de todas as entradas
- **SQL Injection Prevention**: Prepared statements sempre

### 3. Infrastructure Security
- **HTTPS Everywhere**: SSL/TLS em todas as comunicações
- **Environment Variables**: Gerenciamento seguro de secrets
- **CORS Policy**: Política restritiva de CORS
- **Rate Limiting**: Proteção contra ataques de força bruta

## Monitoramento e Observabilidade

### 1. Logging
- **Structured Logging**: Logs estruturados para análise
- **Error Tracking**: Rastreamento automático de erros
- **Performance Metrics**: Métricas de performance em tempo real
- **User Analytics**: Análise de comportamento do usuário

### 2. Health Checks
- **System Health**: Monitoramento da saúde do sistema
- **Database Health**: Verificação da conexão com o banco
- **API Health**: Status das APIs externas
- **Performance Monitoring**: Alertas de performance

## Deployment e DevOps

### 1. CI/CD Pipeline
- **GitHub Actions**: Automação completa de deploy
- **Type Checking**: Verificação de tipos em CI
- **Testing**: Execução automática de testes
- **Build Optimization**: Otimização automática de builds

### 2. Environment Management
- **Multi-Environment**: Dev, Staging, Production
- **Environment Variables**: Configuração por ambiente
- **Database Migrations**: Migrações automáticas
- **Feature Flags**: Deploy gradual de funcionalidades

### 3. Scaling Strategy
- **Horizontal Scaling**: Preparado para escalonamento horizontal
- **Database Scaling**: Estratégia de escalonamento do banco
- **CDN Integration**: Integração com CDN para assets
- **Load Balancing**: Balanceamento de carga configurado