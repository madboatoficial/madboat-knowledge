// ===========================================
// NEBULA ODYSSEY - SPA com Three.js + GSAP
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

// ===========================================
// Inicialização
// ===========================================
function init() {
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
// Cena 1: NEBULA (Partículas roxas/azuis)
// ===========================================
function createNebulaScene() {
    const particlesCount = 5000;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;

        // Posições em forma de nebulosa
        const radius = Math.random() * 15;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 20;

        positions[i3] = Math.cos(angle) * radius;
        positions[i3 + 1] = height;
        positions[i3 + 2] = Math.sin(angle) * radius;

        // Cores roxas e azuis
        const colorChoice = Math.random();
        if (colorChoice < 0.5) {
            // Roxo
            colors[i3] = 0.69 + Math.random() * 0.3;     // R
            colors[i3 + 1] = 0.25 + Math.random() * 0.2; // G
            colors[i3 + 2] = 1.0;                         // B
        } else {
            // Azul escuro
            colors[i3] = 0.2 + Math.random() * 0.2;      // R
            colors[i3 + 1] = 0.3 + Math.random() * 0.3;  // G
            colors[i3 + 2] = 0.8 + Math.random() * 0.2;  // B
        }

        sizes[i] = Math.random() * 3 + 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 1,
        sizeAttenuation: true
    });

    nebulaParticles = new THREE.Points(geometry, material);
    nebulaParticles.userData = { velocities: [] };

    // Velocidades para animação
    for (let i = 0; i < particlesCount; i++) {
        nebulaParticles.userData.velocities.push({
            x: (Math.random() - 0.5) * 0.002,
            y: (Math.random() - 0.5) * 0.002,
            z: (Math.random() - 0.5) * 0.002
        });
    }

    scene.add(nebulaParticles);
}

// ===========================================
// Cena 2: ODYSSEY (Partículas vermelhas/laranjas)
// ===========================================
function createOdysseyScene() {
    const particlesCount = 5000;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;

        // Posições mais dispersas (tema aventura - céu aberto)
        positions[i3] = (Math.random() - 0.5) * 30;
        positions[i3 + 1] = (Math.random() - 0.5) * 30;
        positions[i3 + 2] = (Math.random() - 0.5) * 30;

        // Cores vermelhas, laranjas e douradas
        const colorChoice = Math.random();
        if (colorChoice < 0.4) {
            // Vermelho
            colors[i3] = 1.0;                             // R
            colors[i3 + 1] = 0.19 + Math.random() * 0.2;  // G
            colors[i3 + 2] = 0.19 + Math.random() * 0.2;  // B
        } else if (colorChoice < 0.7) {
            // Laranja
            colors[i3] = 1.0;                             // R
            colors[i3 + 1] = 0.5 + Math.random() * 0.3;   // G
            colors[i3 + 2] = 0.1 + Math.random() * 0.2;   // B
        } else {
            // Dourado
            colors[i3] = 1.0;                             // R
            colors[i3 + 1] = 0.84 + Math.random() * 0.1;  // G
            colors[i3 + 2] = 0.0 + Math.random() * 0.3;   // B
        }

        sizes[i] = Math.random() * 3 + 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0,
        sizeAttenuation: true
    });

    odysseyParticles = new THREE.Points(geometry, material);
    odysseyParticles.userData = { velocities: [] };

    // Velocidades para animação
    for (let i = 0; i < particlesCount; i++) {
        odysseyParticles.userData.velocities.push({
            x: (Math.random() - 0.5) * 0.003,
            y: (Math.random() - 0.5) * 0.003,
            z: (Math.random() - 0.5) * 0.003
        });
    }

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
    // Transição suave entre 0.3 e 0.7
    const transitionStart = 0.3;
    const transitionEnd = 0.7;

    let transitionProgress = 0;

    if (progress < transitionStart) {
        transitionProgress = 0;
    } else if (progress > transitionEnd) {
        transitionProgress = 1;
    } else {
        transitionProgress = (progress - transitionStart) / (transitionEnd - transitionStart);
    }

    // Atualizar opacidade das partículas
    nebulaParticles.material.opacity = 1 - transitionProgress;
    odysseyParticles.material.opacity = transitionProgress;

    // Atualizar rotação das partículas
    nebulaParticles.rotation.y = progress * Math.PI * 2;
    odysseyParticles.rotation.y = -progress * Math.PI;

    // Atualizar câmera
    camera.position.z = 5 + progress * 5;
    camera.rotation.z = progress * 0.2;

    // Atualizar textos
    const scene1Text = document.querySelector('#scene1-text h1');
    const scene2Text = document.querySelector('#scene2-text h1');

    if (transitionProgress < 0.5) {
        scene1Text.style.opacity = 1 - (transitionProgress * 2);
        scene2Text.style.opacity = 0;
    } else {
        scene1Text.style.opacity = 0;
        scene2Text.style.opacity = (transitionProgress - 0.5) * 2;
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

    // Animar partículas da nebula
    if (nebulaParticles) {
        const positions = nebulaParticles.geometry.attributes.position.array;
        const velocities = nebulaParticles.userData.velocities;

        for (let i = 0; i < positions.length; i += 3) {
            const index = i / 3;
            positions[i] += velocities[index].x;
            positions[i + 1] += velocities[index].y;
            positions[i + 2] += velocities[index].z;

            // Reset se sair muito longe
            if (Math.abs(positions[i]) > 20) positions[i] *= -0.5;
            if (Math.abs(positions[i + 1]) > 20) positions[i + 1] *= -0.5;
            if (Math.abs(positions[i + 2]) > 20) positions[i + 2] *= -0.5;
        }

        nebulaParticles.geometry.attributes.position.needsUpdate = true;
        nebulaParticles.rotation.y += 0.0002;
    }

    // Animar partículas da odyssey
    if (odysseyParticles) {
        const positions = odysseyParticles.geometry.attributes.position.array;
        const velocities = odysseyParticles.userData.velocities;

        for (let i = 0; i < positions.length; i += 3) {
            const index = i / 3;
            positions[i] += velocities[index].x;
            positions[i + 1] += velocities[index].y;
            positions[i + 2] += velocities[index].z;

            // Reset se sair muito longe
            if (Math.abs(positions[i]) > 20) positions[i] *= -0.5;
            if (Math.abs(positions[i + 1]) > 20) positions[i + 1] *= -0.5;
            if (Math.abs(positions[i + 2]) > 20) positions[i + 2] *= -0.5;
        }

        odysseyParticles.geometry.attributes.position.needsUpdate = true;
        odysseyParticles.rotation.x += 0.0001;
        odysseyParticles.rotation.y -= 0.0003;
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
