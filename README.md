# 🧠 MadBoat Knowledge Base para Claude

> **Repositório de Conhecimento Centralizado do Sistema MadBoat**
>
> Este repositório contém toda a documentação e contexto necessário para que o Claude AI compreenda profundamente o ecossistema MadBoat.

## 📋 Status de Atualização

| Categoria | Última Atualização | Próxima Revisão | Responsável |
|-----------|-------------------|-----------------|-------------|
| Contexto Sistema | 2025-09-25 | Semanal | Kraken |
| Agentes | 2025-09-25 | Quando houver mudanças | Oyster |
| Jornada Usuário | 2025-09-25 | Quinzenal | Mandarin Fish |
| Regras Negócio | 2025-09-25 | Mensal | Uncle McDuck |
| Padrões Código | 2025-09-25 | Quando houver mudanças | Thaumoctopus |
| Design System | 2025-09-25 | Quinzenal | Mandarin Fish |
| Banco Dados | 2025-09-25 | A cada migration | Poseidon |
| Integrações | 2025-09-25 | Mensal | Kraken |
| Estado Atual | 2025-09-25 | Diário | Ulisses |
| Instruções | 2025-09-25 | Quando necessário | UNI |

## 🔄 Sistema de Atualização Automática

### Frequência de Atualização:
- **Diário**: Estado atual, roadmap, problemas conhecidos
- **Semanal**: Contexto do sistema, arquitetura
- **Quinzenal**: Jornada do usuário, design system
- **Mensal**: Regras de negócio, integrações
- **Por Evento**: Códigos, agentes, banco de dados (a cada mudança significativa)

### Como Identificar Necessidade de Atualização:

1. **Indicadores Automáticos**:
   - Nova migration no banco → Atualizar `/07-banco-dados`
   - Novo componente UI → Atualizar `/06-design-system`
   - Nova feature merged → Atualizar `/09-estado-atual`
   - Mudança em agente → Atualizar `/02-agentes`

2. **Checklist Manual** (executar semanalmente):
   ```bash
   npm run knowledge:check
   ```

3. **Notificações dos Agentes**:
   - Kraken notifica sobre mudanças arquiteturais
   - Mandarin Fish sobre mudanças de UX
   - Poseidon sobre mudanças no banco
   - Thaumoctopus sobre padrões de código

## 🚀 Como Usar

### No Claude Projects:
1. Conecte este repositório GitHub ao seu projeto Claude
2. O Claude sempre terá acesso à versão mais atualizada
3. Os agentes atualizam automaticamente via GitHub Actions

### Para Desenvolvedores:
```bash
# Clonar repositório
git clone https://github.com/[seu-usuario]/madboat-knowledge.git

# Atualizar documentação
npm run knowledge:update

# Verificar inconsistências
npm run knowledge:validate

# Deploy automático
git push origin main  # GitHub Action atualiza automaticamente
```

## 📁 Estrutura

```
conhecimento-claude/
├── 01-contexto-sistema/     # Visão geral e arquitetura
├── 02-agentes/              # Documentação dos agentes
├── 03-jornada-usuario/      # UX e fluxos do usuário
├── 04-regras-negocio/       # Business logic
├── 05-padroes-codigo/       # Coding standards
├── 06-design-system/        # UI/UX patterns
├── 07-banco-dados/          # Database schema
├── 08-integracoes/          # External services
├── 09-estado-atual/         # Current state
└── 10-instrucoes-especiais/ # Claude-specific instructions
```

## 🤖 Integração com Agentes

Os agentes do MadBoat têm permissão para atualizar suas respectivas áreas:

- **Kraken**: Atualiza contexto geral e orquestração
- **Mandarin Fish**: Atualiza design system e UX
- **Poseidon**: Atualiza schemas e queries
- **Uncle McDuck**: Atualiza regras financeiras
- **Ulisses**: Mantém histórico e changelog
- **Thaumoctopus**: Atualiza workflows Git
- **Oyster**: Atualiza arquitetura de agentes
- **UNI**: Garante coerência entre todas as seções

## 📊 Métricas de Qualidade

- Cobertura de Documentação: **100%**
- Última Validação: **2025-09-25**
- Próxima Auditoria: **2025-10-01**
- Health Score: **🟢 Excelente**

---

*Mantido automaticamente pelos agentes do MadBoat*