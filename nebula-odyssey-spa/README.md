# 🌌 Nebula Odyssey SPA

Uma Single Page Application interativa criada com **Three.js** e **GSAP**, apresentando transições suaves entre duas cenas temáticas: **NEBULA** e **ODISSEIA**.

## ✨ Características

### Cena 1: NEBULA
- Background preto com efeito de nebulosa em partículas
- 5.000 partículas em cores roxas e azuis
- Texto "NEBULA" em roxo brilhante com efeito glow
- Animação de rotação suave das partículas

### Cena 2: ODISSEIA
- Tema de aventura com partículas vermelhas, laranjas e douradas
- Transição suave ativada por scroll ou drag do mouse
- Texto "ODISSEIA" em vermelho brilhante
- Efeito de profundidade com movimento da câmera

## 🎮 Interações

- **Scroll**: Role o mouse para transitar entre as cenas
- **Mouse Drag**: Clique e arraste para controlar a transição
- **Parallax**: Movimento do mouse cria efeito parallax na câmera
- **Touch**: Suporte completo para dispositivos móveis
- **Animação Reversível**: Role para trás para voltar à cena anterior

## 🚀 Como Usar

1. Abra o arquivo `index.html` em um navegador moderno
2. Role ou arraste para ver as transições
3. A animação é completamente reversível - role para trás!

## 📦 Tecnologias

- **Three.js** (r128) - Renderização 3D e sistema de partículas
- **GSAP 3.12.5** - Animações suaves e transições
- **ScrollTrigger** - Controle de animações baseado em scroll
- **HTML5 Canvas** - Renderização de alta performance

## 🎨 Customização

### Cores da Nebula
Edite em `main.js` na função `createNebulaScene()`:
```javascript
// Roxo
colors[i3] = 0.69;     // R
colors[i3 + 1] = 0.25; // G
colors[i3 + 2] = 1.0;  // B
```

### Cores da Odyssey
Edite em `main.js` na função `createOdysseyScene()`:
```javascript
// Vermelho
colors[i3] = 1.0;      // R
colors[i3 + 1] = 0.19; // G
colors[i3 + 2] = 0.19; // B
```

### Velocidade de Transição
Ajuste em `main.js` na função `updateSceneTransition()`:
```javascript
const transitionStart = 0.3; // Início (0-1)
const transitionEnd = 0.7;   // Fim (0-1)
```

### Quantidade de Partículas
Modifique nas funções de criação de cena:
```javascript
const particlesCount = 5000; // Ajuste conforme necessário
```

## 📱 Responsividade

O projeto é totalmente responsivo e funciona em:
- Desktop (mouse + scroll)
- Tablet (touch)
- Mobile (touch)

Breakpoints CSS:
- Desktop: > 768px
- Tablet: 480px - 768px
- Mobile: < 480px

## 🌟 Features Técnicas

- Sistema de partículas otimizado com BufferGeometry
- Blending aditivo para efeitos luminosos
- Fog para profundidade atmosférica
- Animações suaves com easing
- Gerenciamento eficiente de memória
- Pixel ratio adaptativo para diferentes telas
- Velocidades individuais para cada partícula
- Reset automático de partículas fora dos limites

## 📄 Estrutura de Arquivos

```
nebula-odyssey-spa/
├── index.html          # Estrutura HTML
├── style.css           # Estilos e animações CSS
├── main.js             # Lógica Three.js + GSAP
└── README.md          # Documentação
```

## 🎯 Próximos Passos Possíveis

- [ ] Adicionar mais cenas temáticas
- [ ] Implementar áudio reativo
- [ ] Adicionar preloader animado
- [ ] Criar modo de visualização automática
- [ ] Adicionar controles de velocidade de transição
- [ ] Implementar modo de debug
- [ ] Adicionar easter eggs interativos
- [ ] Performance monitoring

## ⚡ Performance

- FPS Target: 60fps
- Partículas Totais: 10.000 (2 cenas)
- Uso de Memória: ~50MB
- Compatível com: Chrome, Firefox, Safari, Edge

## 🐛 Troubleshooting

### A página está lenta
- Reduza `particlesCount` em `main.js`
- Desative efeitos de blur no navegador

### As transições não funcionam
- Verifique se os scripts GSAP foram carregados
- Abra o console do navegador para ver erros

### Partículas não aparecem
- Verifique compatibilidade WebGL do navegador
- Atualize drivers gráficos

---

**Stack**: Three.js + GSAP
**Criado**: 2025-11-05
**Versão**: 1.0.0
