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
// Cena 2: ODYSSEY (Shader customizado)
// ===========================================
function createOdysseyScene() {
    const particlesCount = 2500; // Reduzido e ajustado
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    const random = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;

        // Posições mais dispersas (tema aventura)
        positions[i3] = (Math.random() - 0.5) * 35;
        positions[i3 + 1] = (Math.random() - 0.5) * 25;
        positions[i3 + 2] = (Math.random() - 0.5) * 35;

        // Cores mais sutis - vermelho, laranja e dourado
        const colorChoice = Math.random();
        if (colorChoice < 0.4) {
            // Vermelho suave
            colors[i3] = 0.8 + Math.random() * 0.2;      // R
            colors[i3 + 1] = 0.2 + Math.random() * 0.15; // G
            colors[i3 + 2] = 0.15 + Math.random() * 0.1; // B
        } else if (colorChoice < 0.7) {
            // Laranja suave
            colors[i3] = 0.9 + Math.random() * 0.1;      // R
            colors[i3 + 1] = 0.45 + Math.random() * 0.2; // G
            colors[i3 + 2] = 0.1 + Math.random() * 0.1;  // B
        } else {
            // Dourado suave
            colors[i3] = 0.85 + Math.random() * 0.15;    // R
            colors[i3 + 1] = 0.7 + Math.random() * 0.15; // G
            colors[i3 + 2] = 0.2 + Math.random() * 0.2;  // B
        }

        sizes[i] = Math.random() * 2.5 + 0.8;
        random[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(random, 1));

    // Shader customizado para Odyssey
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uOpacity: { value: 0.0 }
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

                // Movimento mais dinâmico (tema aventura)
                modelPosition.x += sin(uTime * 0.8 + aRandom * 8.0) * 0.4;
                modelPosition.y += cos(uTime * 0.6 + aRandom * 6.0) * 0.35;
                modelPosition.z += sin(uTime * 0.4 + aRandom * 4.0) * 0.25;

                vec4 viewPosition = viewMatrix * modelPosition;
                vec4 projectedPosition = projectionMatrix * viewPosition;

                gl_Position = projectedPosition;

                // Tamanho com fade pela distância
                float sizeAttenuation = 1.0 / -viewPosition.z;
                gl_PointSize = aSize * uPixelRatio * 18.0 * sizeAttenuation;

                // Variação de alpha
                vAlpha = (0.25 + aRandom * 0.5) * uOpacity;
                vColor = color;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                // Partícula circular com brilho central
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);

                // Gradiente com core mais brilhante
                float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;

                // Adiciona brilho no centro
                float glow = smoothstep(0.3, 0.0, dist);
                vec3 finalColor = vColor * (1.0 + glow * 0.5);

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
    const scrollIndicator = document.getElementById('scroll-indicator');

    // Animar entrada do texto NEBULA
    gsap.to(scene1Text, {
        opacity: 1,
        duration: 2,
        ease: 'power2.out',
        delay: 0.5
    });

    // ScrollTrigger para transição entre cenas
    ScrollTrigger.create({
        trigger: '#container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
            scrollProgress = self.progress;
            updateSceneTransition(scrollProgress);
        }
    });

    // Animação do indicador de scroll
    gsap.to(scrollIndicator, {
        scrollTrigger: {
            trigger: '#container',
            start: 'top top',
            end: '20% top',
            scrub: true
        },
        opacity: 0
    });
}

// ===========================================
// Atualizar transição entre cenas
// ===========================================
function updateSceneTransition(progress) {
    // Transição mais suave entre 0.25 e 0.75
    const transitionStart = 0.25;
    const transitionEnd = 0.75;

    let transitionProgress = 0;

    if (progress < transitionStart) {
        transitionProgress = 0;
    } else if (progress > transitionEnd) {
        transitionProgress = 1;
    } else {
        transitionProgress = (progress - transitionStart) / (transitionEnd - transitionStart);
    }

    // Easing suave para transição
    const easedProgress = transitionProgress < 0.5
        ? 2 * transitionProgress * transitionProgress
        : 1 - Math.pow(-2 * transitionProgress + 2, 2) / 2;

    // Atualizar opacidade das partículas via uniforms
    nebulaParticles.material.uniforms.uOpacity.value = 1 - easedProgress;
    odysseyParticles.material.uniforms.uOpacity.value = easedProgress;

    // Rotação mais sutil
    nebulaParticles.rotation.y = progress * Math.PI * 0.5;
    odysseyParticles.rotation.y = -progress * Math.PI * 0.3;

    // Movimento de câmera mais sutil
    camera.position.z = 5 + progress * 3;
    camera.rotation.z = progress * 0.05;

    // Atualizar textos com fade mais suave
    const scene1Text = document.querySelector('#scene1-text h1');
    const scene2Text = document.querySelector('#scene2-text h1');

    if (easedProgress < 0.4) {
        scene1Text.style.opacity = 1 - (easedProgress * 2.5);
        scene2Text.style.opacity = 0;
    } else {
        scene1Text.style.opacity = 0;
        scene2Text.style.opacity = (easedProgress - 0.4) * 1.66;
    }
}

// ===========================================
// Controles (Mouse Drag)
// ===========================================
function setupControls() {
    let mouseY = 0;
    let targetScrollY = window.scrollY;

    // Mouse move para parallax suave
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) {
            mouseY = (e.clientY / window.innerHeight) * 2 - 1;

            gsap.to(camera.position, {
                y: mouseY * 0.5,
                duration: 1,
                ease: 'power2.out'
            });
        }
    });

    // Mouse drag para scroll
    document.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.clientY;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaY = startY - e.clientY;
            targetScrollY += deltaY * 2;
            targetScrollY = Math.max(0, Math.min(targetScrollY, document.body.scrollHeight - window.innerHeight));

            gsap.to(window, {
                scrollTo: targetScrollY,
                duration: 0.5,
                ease: 'power2.out'
            });

            startY = e.clientY;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Touch para mobile
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchmove', (e) => {
        const deltaY = touchStartY - e.touches[0].clientY;
        targetScrollY += deltaY * 2;
        targetScrollY = Math.max(0, Math.min(targetScrollY, document.body.scrollHeight - window.innerHeight));

        gsap.to(window, {
            scrollTo: targetScrollY,
            duration: 0.5,
            ease: 'power2.out'
        });

        touchStartY = e.touches[0].clientY;
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
        nebulaParticles.material.uniforms.uTime.value = elapsedTime * 0.5; // Velocidade reduzida
        nebulaParticles.rotation.y += 0.0001; // Rotação mais sutil
    }

    if (odysseyParticles) {
        odysseyParticles.material.uniforms.uTime.value = elapsedTime * 0.6;
        odysseyParticles.rotation.x += 0.00005;
        odysseyParticles.rotation.y -= 0.0002;
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
