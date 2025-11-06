// ===========================================
// NEBULA ODYSSEY - SPA com Three.js + GSAP
// Versão com Shaders Customizados
// ===========================================

// Registrar plugin do GSAP
gsap.registerPlugin(ScrollTrigger);

// ===========================================
// Variáveis Globais
// ===========================================
let scene, camera, renderer;
let nebulaParticles, odysseyParticles;
let currentScene = 0; // 0 = Nebula, 1 = Odyssey
let scrollProgress = 0;
let isDragging = false;
let startY = 0;
let clock;

// ===========================================
// Inicialização
// ===========================================
function init() {
    // Clock para animações
    clock = new THREE.Clock();

    // Setup Three.js
    setupThreeJS();

    // Criar cenas
    createNebulaScene();
    createOdysseyScene();

    // Setup animações GSAP
    setupGSAPAnimations();

    // Setup controles
    setupControls();

    // Iniciar animação
    animate();

    // Resize handler
    window.addEventListener('resize', onWindowResize);
}

// ===========================================
// Setup Three.js
// ===========================================
function setupThreeJS() {
    const canvas = document.getElementById('canvas');

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0008);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// ===========================================
// Cena 1: NEBULA (Shader customizado)
// ===========================================
function createNebulaScene() {
    const particlesCount = 2000; // Reduzido para efeito mais sutil
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    const random = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;

        // Distribuição mais espaçada
        const radius = Math.random() * 20;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 15;

        positions[i3] = Math.cos(angle) * radius;
        positions[i3 + 1] = height;
        positions[i3 + 2] = Math.sin(angle) * radius;

        // Cores mais sutis - roxo e azul
        const colorChoice = Math.random();
        if (colorChoice < 0.6) {
            // Roxo suave
            colors[i3] = 0.5 + Math.random() * 0.2;     // R
            colors[i3 + 1] = 0.2 + Math.random() * 0.15; // G
            colors[i3 + 2] = 0.8 + Math.random() * 0.2;  // B
        } else {
            // Azul suave
            colors[i3] = 0.2 + Math.random() * 0.15;     // R
            colors[i3 + 1] = 0.3 + Math.random() * 0.2;  // G
            colors[i3 + 2] = 0.7 + Math.random() * 0.3;  // B
        }

        sizes[i] = Math.random() * 2 + 0.5;
        random[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(random, 1));

    // Shader customizado
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uOpacity: { value: 1.0 }
        },
        vertexShader: `
            attribute float aSize;
            attribute float aRandom;
            attribute vec3 color;

            uniform float uTime;
            uniform float uPixelRatio;
            uniform float uOpacity;

            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                vec4 modelPosition = modelMatrix * vec4(position, 1.0);

                // Movimento suave ondulante
                modelPosition.y += sin(uTime + aRandom * 10.0) * 0.3;
                modelPosition.x += cos(uTime * 0.5 + aRandom * 5.0) * 0.2;

                vec4 viewPosition = viewMatrix * modelPosition;
                vec4 projectedPosition = projectionMatrix * viewPosition;

                gl_Position = projectedPosition;

                // Tamanho com fade pela distância
                float sizeAttenuation = 1.0 / -viewPosition.z;
                gl_PointSize = aSize * uPixelRatio * 15.0 * sizeAttenuation;

                // Variação de alpha baseada no random
                vAlpha = (0.3 + aRandom * 0.4) * uOpacity;
                vColor = color;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                // Criar partícula circular suave
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);

                // Gradiente suave do centro para borda
                float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;

                // Cor com gradiente suave
                vec3 finalColor = vColor * (1.0 + (0.5 - dist));

                gl_FragColor = vec4(finalColor, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    nebulaParticles = new THREE.Points(geometry, material);
    scene.add(nebulaParticles);
}

// ===========================================
// Cena 2: ODYSSEY (Flâmulas/Ribbons)
// ===========================================
function createOdysseyScene() {
    const ribbonCount = 80; // Número de flâmulas
    const particlesCount = ribbonCount * 30; // 30 pontos por flâmula
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    const random = new Float32Array(particlesCount);
    const ribbonIndex = new Float32Array(particlesCount);

    for (let i = 0; i < ribbonCount; i++) {
        // Posição base de cada flâmula
        const baseX = (Math.random() - 0.5) * 40;
        const baseY = (Math.random() - 0.5) * 30;
        const baseZ = (Math.random() - 0.5) * 40;

        // Cor de cada flâmula
        const colorChoice = Math.random();
        let r, g, b;
        if (colorChoice < 0.4) {
            // Vermelho suave
            r = 0.85 + Math.random() * 0.15;
            g = 0.2 + Math.random() * 0.15;
            b = 0.15 + Math.random() * 0.1;
        } else if (colorChoice < 0.7) {
            // Laranja suave
            r = 0.9 + Math.random() * 0.1;
            g = 0.5 + Math.random() * 0.2;
            b = 0.1 + Math.random() * 0.1;
        } else {
            // Dourado suave
            r = 0.9 + Math.random() * 0.1;
            g = 0.75 + Math.random() * 0.15;
            b = 0.25 + Math.random() * 0.2;
        }

        const ribbonRandom = Math.random();

        // Criar pontos ao longo da flâmula
        for (let j = 0; j < 30; j++) {
            const index = i * 30 + j;
            const i3 = index * 3;

            // Distribuir pontos ao longo do comprimento da flâmula
            const t = j / 29; // 0 a 1

            positions[i3] = baseX + (Math.random() - 0.5) * 0.3;
            positions[i3 + 1] = baseY + t * 3; // Alongar verticalmente
            positions[i3 + 2] = baseZ + (Math.random() - 0.5) * 0.3;

            colors[i3] = r;
            colors[i3 + 1] = g;
            colors[i3 + 2] = b;

            // Tamanho varia ao longo da flâmula (mais largo no topo)
            sizes[index] = (1.0 - t * 0.5) * 3 + Math.random() * 0.5;
            random[index] = ribbonRandom + t * 0.3;
            ribbonIndex[index] = i;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(random, 1));
    geometry.setAttribute('aRibbonIndex', new THREE.BufferAttribute(ribbonIndex, 1));

    // Shader para flâmulas ondulantes
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uOpacity: { value: 0.0 }
        },
        vertexShader: `
            attribute float aSize;
            attribute float aRandom;
            attribute float aRibbonIndex;
            attribute vec3 color;

            uniform float uTime;
            uniform float uPixelRatio;
            uniform float uOpacity;

            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                vec4 modelPosition = modelMatrix * vec4(position, 1.0);

                // Movimento de tecido ondulante
                float wave1 = sin(uTime * 1.2 + aRandom * 10.0 + position.y * 0.5) * 0.8;
                float wave2 = cos(uTime * 0.8 + aRandom * 8.0 + position.y * 0.3) * 0.6;
                float wave3 = sin(uTime * 1.5 + aRandom * 6.0) * 0.4;

                // Aplicar ondulação em X e Z (como tecido ao vento)
                modelPosition.x += wave1 + wave3;
                modelPosition.z += wave2 + wave3 * 0.5;

                // Movimento suave para cima (flâmulas subindo)
                modelPosition.y += sin(uTime * 0.3 + aRibbonIndex * 0.5) * 0.5;

                // Rotação suave
                float rotation = uTime * 0.5 + aRibbonIndex * 0.2;
                float cosR = cos(rotation * 0.1);
                float sinR = sin(rotation * 0.1);
                float newX = modelPosition.x * cosR - modelPosition.z * sinR;
                float newZ = modelPosition.x * sinR + modelPosition.z * cosR;
                modelPosition.x = newX;
                modelPosition.z = newZ;

                vec4 viewPosition = viewMatrix * modelPosition;
                vec4 projectedPosition = projectionMatrix * viewPosition;

                gl_Position = projectedPosition;

                // Tamanho com perspectiva
                float sizeAttenuation = 1.0 / -viewPosition.z;
                gl_PointSize = aSize * uPixelRatio * 20.0 * sizeAttenuation;

                // Alpha varia ao longo da flâmula
                vAlpha = (0.3 + aRandom * 0.5) * uOpacity;
                vColor = color;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                // Forma alongada de flâmula
                vec2 coord = gl_PointCoord - vec2(0.5);

                // Distância elíptica (mais alongado horizontalmente)
                float distX = coord.x * 2.0;
                float distY = coord.y;
                float dist = length(vec2(distX, distY));

                // Gradiente suave
                float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;

                // Brilho suave no centro
                float glow = smoothstep(0.4, 0.0, dist);
                vec3 finalColor = vColor * (1.0 + glow * 0.3);

                gl_FragColor = vec4(finalColor, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    odysseyParticles = new THREE.Points(geometry, material);
    scene.add(odysseyParticles);
}

// ===========================================
// Animações GSAP
// ===========================================
function setupGSAPAnimations() {
    const scene1Text = document.querySelector('#scene1-text h1');
    const scene2Text = document.querySelector('#scene2-text h1');
    const logoContainer = document.querySelector('.logo-container');
    const subtitle = document.querySelector('.subtitle');
    const scrollIndicator = document.getElementById('scroll-indicator');

    // Timeline para entrada da cena 1
    const introTimeline = gsap.timeline({ delay: 0.3 });

    introTimeline
        .to(logoContainer, {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: 'power3.out'
        })
        .to(scene1Text, {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: 'power3.out'
        }, '-=1')
        .to(subtitle, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power2.out'
        }, '-=0.8');

    // ScrollTrigger para transição entre cenas com morph (HORIZONTAL)
    ScrollTrigger.create({
        trigger: '#container',
        start: 'left left',
        end: 'right right',
        horizontal: true,
        scrub: 1.5, // Scrub mais suave para morph
        onUpdate: (self) => {
            scrollProgress = self.progress;
            updateSceneTransition(scrollProgress);
        }
    });

    // Animação do indicador de scroll
    gsap.to(scrollIndicator, {
        scrollTrigger: {
            trigger: '#container',
            start: 'left left',
            end: '20% left',
            horizontal: true,
            scrub: true
        },
        opacity: 0
    });
}

// ===========================================
// Atualizar transição entre cenas (com morph)
// ===========================================
function updateSceneTransition(progress) {
    // Transição mais suave entre 0.2 e 0.8
    const transitionStart = 0.2;
    const transitionEnd = 0.8;

    let transitionProgress = 0;

    if (progress < transitionStart) {
        transitionProgress = 0;
    } else if (progress > transitionEnd) {
        transitionProgress = 1;
    } else {
        transitionProgress = (progress - transitionStart) / (transitionEnd - transitionStart);
    }

    // Easing suave com curva personalizada para morph
    const easedProgress = transitionProgress < 0.5
        ? 4 * transitionProgress * transitionProgress * transitionProgress
        : 1 - Math.pow(-2 * transitionProgress + 2, 3) / 2;

    // Atualizar opacidade das partículas via uniforms (morph suave)
    nebulaParticles.material.uniforms.uOpacity.value = 1 - easedProgress;
    odysseyParticles.material.uniforms.uOpacity.value = easedProgress;

    // Rotação com morph
    nebulaParticles.rotation.y = progress * Math.PI * 0.3;
    nebulaParticles.rotation.x = progress * Math.PI * 0.1;

    odysseyParticles.rotation.y = -progress * Math.PI * 0.2;
    odysseyParticles.rotation.z = progress * Math.PI * 0.15;

    // Movimento de câmera com zoom suave
    camera.position.z = 5 + easedProgress * 4;
    camera.position.y = (easedProgress - 0.5) * 2;
    camera.rotation.z = easedProgress * 0.03;

    // Atualizar elementos da UI
    const scene1Text = document.querySelector('#scene1-text h1');
    const scene2Text = document.querySelector('#scene2-text h1');
    const logoContainer = document.querySelector('.logo-container');
    const subtitle = document.querySelector('.subtitle');

    // Fade dos elementos da cena 1
    if (easedProgress < 0.3) {
        logoContainer.style.opacity = 1 - (easedProgress * 3.33);
        scene1Text.style.opacity = 1 - (easedProgress * 2.5);
        subtitle.style.opacity = 1 - (easedProgress * 3);
        scene2Text.style.opacity = 0;
    } else {
        logoContainer.style.opacity = 0;
        scene1Text.style.opacity = 0;
        subtitle.style.opacity = 0;
        scene2Text.style.opacity = (easedProgress - 0.3) * 1.43;
    }

    // Escala dos elementos durante transição (efeito morph)
    const scaleNebula = 1 - easedProgress * 0.2;
    const scaleOdyssey = 0.8 + easedProgress * 0.2;

    logoContainer.style.transform = `scale(${scaleNebula})`;
    scene1Text.style.transform = `scale(${scaleNebula})`;
    subtitle.style.transform = `scale(${scaleNebula})`;
    scene2Text.style.transform = `scale(${scaleOdyssey})`;
}

// ===========================================
// Controles (Mouse Drag Horizontal)
// ===========================================
function setupControls() {
    let mouseX = 0;
    let targetScrollX = window.scrollX;

    // Mouse move para parallax suave (vertical ainda funciona para profundidade)
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) {
            const mouseY = (e.clientY / window.innerHeight) * 2 - 1;

            gsap.to(camera.position, {
                y: mouseY * 0.5,
                duration: 1,
                ease: 'power2.out'
            });
        }
    });

    // Mouse drag para scroll HORIZONTAL
    document.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.clientX; // Agora captura X
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = startY - e.clientX; // Delta horizontal
            targetScrollX += deltaX * 2;
            targetScrollX = Math.max(0, Math.min(targetScrollX, document.body.scrollWidth - window.innerWidth));

            window.scrollTo({
                left: targetScrollX,
                behavior: 'auto'
            });

            startY = e.clientX;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Touch para mobile (HORIZONTAL)
    let touchStartX = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });

    document.addEventListener('touchmove', (e) => {
        const deltaX = touchStartX - e.touches[0].clientX;
        targetScrollX += deltaX * 2;
        targetScrollX = Math.max(0, Math.min(targetScrollX, document.body.scrollWidth - window.innerWidth));

        window.scrollTo({
            left: targetScrollX,
            behavior: 'auto'
        });

        touchStartX = e.touches[0].clientX;
    });
}

// ===========================================
// Loop de Animação
// ===========================================
function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Atualizar tempo nos shaders
    if (nebulaParticles) {
        nebulaParticles.material.uniforms.uTime.value = elapsedTime * 0.4;
        nebulaParticles.rotation.y += 0.00008;
    }

    if (odysseyParticles) {
        // Flâmulas com movimento mais rápido e fluido
        odysseyParticles.material.uniforms.uTime.value = elapsedTime * 0.8;
        odysseyParticles.rotation.x += 0.0001;
        odysseyParticles.rotation.y -= 0.00015;
    }

    renderer.render(scene, camera);
}

// ===========================================
// Resize Handler
// ===========================================
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ===========================================
// Iniciar quando DOM carregar
// ===========================================
document.addEventListener('DOMContentLoaded', init);
