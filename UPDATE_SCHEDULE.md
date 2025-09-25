# 📅 Cronograma de Atualização do Knowledge Base

## 🔄 Frequências de Atualização

### Diário (Automático)
**Horário**: 02:00 AM UTC
**Responsável**: GitHub Actions

- [ ] `/09-estado-atual/ROADMAP.md`
- [ ] `/09-estado-atual/PROBLEMAS_CONHECIDOS.md`
- [ ] `/09-estado-atual/CHANGELOG.md`

### Semanal (Segunda-feira)
**Horário**: 14:00 UTC
**Responsável**: Kraken

- [ ] `/01-contexto-sistema/*` - Revisar mudanças arquiteturais
- [ ] `/02-agentes/SISTEMA_AGENTES.md` - Status dos agentes
- [ ] Métricas de performance

### Quinzenal (1º e 15º)
**Responsável**: Mandarin Fish + Ulisses

- [ ] `/03-jornada-usuario/*` - Atualizar progresso dos modais
- [ ] `/06-design-system/*` - Novos componentes e patterns

### Mensal (Último dia)
**Responsável**: Uncle McDuck + Poseidon

- [ ] `/04-regras-negocio/*` - Revisar business logic
- [ ] `/07-banco-dados/*` - Documentar migrations
- [ ] `/08-integracoes/*` - Status das integrações

### Por Evento (Trigger Automático)

#### Ao criar nova migration:
- [ ] Atualizar `/07-banco-dados/SCHEMA_ATUAL.md`
- [ ] Documentar em `/07-banco-dados/MIGRATIONS_LOG.md`
- [ ] Atualizar RLS policies se aplicável

#### Ao adicionar novo componente:
- [ ] Documentar em `/06-design-system/COMPONENTES.md`
- [ ] Adicionar exemplo de uso
- [ ] Atualizar design tokens se necessário

#### Ao implementar novo agente:
- [ ] Criar doc em `/02-agentes/[AGENT_NAME].md`
- [ ] Atualizar `/02-agentes/SISTEMA_AGENTES.md`
- [ ] Documentar protocolo de comunicação

#### Ao completar feature major:
- [ ] Atualizar `/09-estado-atual/ROADMAP.md`
- [ ] Documentar em `/09-estado-atual/HISTORICO_MUDANCAS.md`
- [ ] Revisar impacto em outros docs

## 🎯 Indicadores de Necessidade de Atualização

### 🔴 Crítico (Atualizar Imediatamente)
- Breaking changes na API
- Mudanças de segurança
- Novas migrations críticas
- Alterações em RLS policies
- Mudanças em autenticação

### 🟡 Importante (Dentro de 24h)
- Novos endpoints
- Mudanças significativas de UX
- Novos agentes ou major updates
- Alterações em business rules
- Mudanças em integrações

### 🟢 Regular (Próximo ciclo)
- Melhorias de performance
- Refatorações internas
- Documentação adicional
- Otimizações menores
- Cleanup de código

## 📊 Métricas de Qualidade

### Coverage Targets
- Documentação de código: **>80%**
- Cobertura de features: **100%**
- Exemplos de uso: **>90%**
- Links funcionais: **100%**

### Health Checks
```bash
# Verificar saúde da documentação
npm run validate

# Checar necessidade de updates
npm run check

# Monitorar mudanças
npm run monitor
```

## 🤖 Automação via Agentes

### Kraken (Orquestrador)
- Monitora mudanças globais
- Trigger updates críticos
- Coordena outros agentes

### Ulisses (Cronista)
- Mantém changelog
- Documenta decisões
- Preserva contexto histórico

### Thaumoctopus (Git Master)
- Sincroniza com main repo
- Gerencia branches de docs
- Automatiza commits

## 📝 Checklist Manual Semanal

### Segunda-feira
- [ ] Review do que mudou na semana anterior
- [ ] Identificar gaps na documentação
- [ ] Priorizar updates necessários

### Quarta-feira
- [ ] Mid-week check de progresso
- [ ] Ajustar prioridades se necessário

### Sexta-feira
- [ ] Validação completa
- [ ] Preparar relatório semanal
- [ ] Planejar próxima semana

## 🚨 Sistema de Alertas

### Configurar notificações para:
1. **Migrations novas**: Alert imediato
2. **Breaking changes**: Alert crítico
3. **Novos agentes**: Alert importante
4. **Features completas**: Alert informativo

### Canais de Notificação
- GitHub Issues (auto-criadas)
- Slack #madboat-updates
- Email para maintainers

## 📈 Relatório de Status

### Template Semanal
```markdown
## Knowledge Base Status - Semana [XX]

### ✅ Atualizações Realizadas
- [Lista de updates]

### 🚧 Em Progresso
- [Updates pendentes]

### 📋 Planejado
- [Próximos updates]

### 📊 Métricas
- Docs coverage: XX%
- Links válidos: XX%
- Última validação: [data]
```

---

## 🔧 Scripts Úteis

### Update rápido
```bash
cd conhecimento-claude
npm run sync
```

### Validação completa
```bash
npm run validate && npm run check
```

### Gerar relatório
```bash
npm run generate:changelog
```

---

*Mantenha este documento sempre atualizado com as últimas práticas*