# 🚀 Como Usar o Knowledge Base do MadBoat

## Para o Claude Projects

### 1. Configuração Inicial

1. **Acesse Claude Projects**
   - Vá para [claude.ai](https://claude.ai)
   - Crie um novo projeto ou abra o existente "MadBoat-v3"

2. **Conecte o GitHub**
   - Clique em "+" para adicionar conteúdo
   - Selecione "GitHub"
   - Conecte o repositório `madboat-knowledge`
   - Claude sincronizará automaticamente

3. **Pronto!**
   - Claude agora tem acesso a todo conhecimento
   - Atualizações são sincronizadas automaticamente
   - Não precisa fazer mais nada!

### 2. Como o Claude Usará

Quando você fizer perguntas sobre o MadBoat, o Claude:
- ✅ Consultará automaticamente a knowledge base
- ✅ Terá contexto completo do sistema
- ✅ Saberá qual agente sugerir para cada tarefa
- ✅ Seguirá os padrões e convenções estabelecidos

## Para Desenvolvedores

### 1. Clonando o Repositório

```bash
# Clone o repo de conhecimento
git clone https://github.com/seu-usuario/madboat-knowledge.git
cd madboat-knowledge

# Instale dependências
npm install
```

### 2. Estrutura de Pastas

```
conhecimento-claude/
├── 01-contexto-sistema/      # Visão geral e arquitetura
├── 02-agentes/               # Docs dos 8 agentes
├── 03-jornada-usuario/       # Sistema de 7 modais
├── 04-regras-negocio/        # Business logic
├── 05-padroes-codigo/        # Coding standards
├── 06-design-system/         # UI patterns
├── 07-banco-dados/           # Schema e migrations
├── 08-integracoes/           # APIs externas
├── 09-estado-atual/          # Status e roadmap
└── 10-instrucoes-especiais/  # Como Claude deve agir
```

### 3. Atualizando Conteúdo

#### Atualização Manual
```bash
# Edite o arquivo necessário
nano 03-jornada-usuario/SISTEMA_7_MODAIS.md

# Commit e push
git add .
git commit -m "📝 Update: descrição da mudança"
git push
```

#### Atualização Automática
```bash
# Script que detecta mudanças e atualiza
npm run update

# Validar antes de publicar
npm run validate

# Sync completo
npm run sync
```

### 4. Quando Atualizar?

| Evento | Ação Necessária |
|--------|----------------|
| Nova feature implementada | Atualizar `/09-estado-atual/` |
| Novo componente UI | Atualizar `/06-design-system/` |
| Migration no banco | Atualizar `/07-banco-dados/` |
| Mudança em agente | Atualizar `/02-agentes/` |
| Nova regra de negócio | Atualizar `/04-regras-negocio/` |

## Para os Agentes

### Como Agentes Atualizam

Cada agente tem permissão para atualizar sua área:

```yaml
# Kraken atualiza contexto geral
kraken:
  updates:
    - /01-contexto-sistema/
    - /09-estado-atual/

# Mandarin Fish atualiza UI/UX
mandarin_fish:
  updates:
    - /06-design-system/
    - /03-jornada-usuario/

# Poseidon atualiza banco
poseidon:
  updates:
    - /07-banco-dados/
```

### Protocolo de Atualização

1. **Detectar mudança**
   ```bash
   git diff HEAD^ HEAD --name-only
   ```

2. **Atualizar doc relevante**
   ```bash
   echo "Nova info" >> conhecimento-claude/area/arquivo.md
   ```

3. **Commit com tag do agente**
   ```bash
   git commit -m "🐙 [Kraken] Update: contexto sistema"
   ```

## Integração com CI/CD

### GitHub Actions Automático

O repositório tem Actions que:
- 🔄 Atualizam diariamente às 2 AM
- ✅ Validam estrutura a cada push
- 📊 Geram relatórios semanais
- 🚨 Alertam sobre inconsistências

### Webhook para Updates Críticos

```javascript
// Exemplo de trigger manual
fetch('https://api.github.com/repos/user/madboat-knowledge/dispatches', {
  method: 'POST',
  headers: {
    'Authorization': 'token YOUR_GITHUB_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    event_type: 'update-knowledge',
    client_payload: {
      area: 'database',
      priority: 'high'
    }
  })
});
```

## Troubleshooting

### Claude não está vendo atualizações?
1. Verifique se o repo está conectado
2. Force sync no Claude Projects
3. Aguarde 5 minutos (cache)

### Validação falhando?
```bash
# Checar estrutura
npm run validate

# Ver erros específicos
npm run validate -- --verbose
```

### Conflitos no Git?
```bash
# Sempre pull antes de editar
git pull origin main

# Em caso de conflito
git stash
git pull
git stash pop
# Resolver conflitos manualmente
```

## Best Practices

### ✅ DO
- Mantenha documentação concisa mas completa
- Use exemplos de código reais
- Atualize imediatamente após mudanças críticas
- Valide antes de publicar
- Use markdown formatting consistente

### ❌ DON'T
- Não inclua secrets ou dados sensíveis
- Não duplique informação
- Não quebre links existentes
- Não delete histórico importante
- Não faça updates parciais

## Métricas de Sucesso

### Como saber se está funcionando?

1. **Claude responde com contexto correto** ✅
2. **Sugere agentes apropriados** ✅
3. **Segue padrões do MadBoat** ✅
4. **Conhece estado atual do projeto** ✅
5. **Aplica business rules corretamente** ✅

## Suporte

### Problemas ou Dúvidas?

- 📧 Email: support@madboat.app
- 💬 Discord: [MadBoat Community](https://discord.gg/madboat)
- 🐙 GitHub Issues: [madboat-knowledge/issues](https://github.com/user/madboat-knowledge/issues)

---

*"Conhecimento compartilhado é poder multiplicado"* - Filosofia MadBoat