/**
 * ThreeBackground — Reusable 3D Abstract Geometric & Particle Constellation
 * Inspired by modern editorial aesthetics (noth.in).
 * Lightweight, high-performance WebGL scene featuring:
 * - Ambient floating particle field with depth
 * - Abstract rotating geometric wireframe object (Icosahedron / Ring mesh)
 * - Smooth mouse parallax with inertia & damping
 * - Dynamic Dark / Light theme transition
 * - Automatic devicePixelRatio capping (<= 2)
 * - Full prefers-reduced-motion accessibility support
 */
(function (global) {
    let scene, camera, renderer, particles, wireMesh, innerCore;
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    let isLightTheme = false;
    let isReducedMotion = false;
    let isInitialized = false;
    let animationFrameId = null;

    function init(canvasId = 'webgl-bg', options = {}) {
        if (isInitialized) return;

        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        if (typeof THREE === 'undefined') {
            console.warn('[ThreeBackground] THREE.js library not loaded.');
            return;
        }

        // Check prefers-reduced-motion
        if (window.matchMedia) {
            const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
            isReducedMotion = mq.matches;
            mq.addEventListener('change', (e) => {
                isReducedMotion = e.matches;
            });
        }

        // Determine active theme
        const currentTheme = document.documentElement.getAttribute('data-theme') ||
                             document.body.getAttribute('data-theme') ||
                             'dark';
        isLightTheme = (currentTheme === 'light');

        try {
            // 1. Scene & Camera setup
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(
                60,
                window.innerWidth / window.innerHeight,
                1,
                3000
            );
            camera.position.z = 950;

            // 2. Ambient Particles Field
            const particleCount = options.particleCount || 750;
            const particleGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const scales = new Float32Array(particleCount);

            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 2200;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 1800;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 1600;
                scales[i] = Math.random() * 0.8 + 0.2;
            }

            particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const particleMaterial = new THREE.PointsMaterial({
                color: isLightTheme ? 0x4f46e5 : 0x818cf8,
                size: options.particleSize || 3.5,
                transparent: true,
                opacity: isLightTheme ? 0.45 : 0.65,
                blending: isLightTheme ? THREE.NormalBlending : THREE.AdditiveBlending,
                sizeAttenuation: true
            });

            particles = new THREE.Points(particleGeometry, particleMaterial);
            scene.add(particles);

            // 3. Abstract Geometric Wireframe Object (Positioned on the Left for Desktop)
            const isDesktop = window.innerWidth >= 1024;
            const geomGroup = new THREE.Group();
            
            // Outer Icosahedron Wireframe
            const icoGeo = new THREE.IcosahedronGeometry(180, 1);
            const icoMat = new THREE.MeshBasicMaterial({
                color: isLightTheme ? 0x6366f1 : 0x818cf8,
                wireframe: true,
                transparent: true,
                opacity: isLightTheme ? 0.22 : 0.35
            });
            wireMesh = new THREE.Mesh(icoGeo, icoMat);
            geomGroup.add(wireMesh);

            // Inner Core Ring
            const ringGeo = new THREE.TorusGeometry(120, 2, 16, 64);
            const ringMat = new THREE.MeshBasicMaterial({
                color: isLightTheme ? 0xa855f7 : 0xc084fc,
                wireframe: true,
                transparent: true,
                opacity: isLightTheme ? 0.3 : 0.45
            });
            innerCore = new THREE.Mesh(ringGeo, ringMat);
            geomGroup.add(innerCore);

            // Position geometric object on the left half of the screen on desktop
            geomGroup.position.x = isDesktop ? -window.innerWidth * 0.22 : 0;
            geomGroup.position.y = 0;
            geomGroup.position.z = 100;
            scene.add(geomGroup);

            // 4. Renderer
            renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance'
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.setSize(window.innerWidth, window.innerHeight);

            // 5. Event Listeners
            document.addEventListener('mousemove', onMouseMove, { passive: true });
            window.addEventListener('resize', onResize, { passive: true });

            isInitialized = true;
            animate();
        } catch (err) {
            console.warn('[ThreeBackground] WebGL initialization failed (graceful fallback):', err);
        }
    }

    function onMouseMove(event) {
        targetMouseX = (event.clientX - window.innerWidth / 2) * 0.45;
        targetMouseY = (event.clientY - window.innerHeight / 2) * 0.45;
    }

    function onResize() {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

        if (scene) {
            const isDesktop = window.innerWidth >= 1024;
            scene.children.forEach(child => {
                if (child.type === 'Group') {
                    child.position.x = isDesktop ? -window.innerWidth * 0.22 : 0;
                    child.position.y = isDesktop ? 0 : -window.innerHeight * 0.15;
                }
            });
        }
    }

    function setTheme(theme) {
        isLightTheme = (theme === 'light');
        if (particles && particles.material) {
            particles.material.color.setHex(isLightTheme ? 0x4f46e5 : 0x818cf8);
            particles.material.opacity = isLightTheme ? 0.45 : 0.65;
            particles.material.blending = isLightTheme ? THREE.NormalBlending : THREE.AdditiveBlending;
            particles.material.needsUpdate = true;
        }
        if (wireMesh && wireMesh.material) {
            wireMesh.material.color.setHex(isLightTheme ? 0x6366f1 : 0x818cf8);
            wireMesh.material.opacity = isLightTheme ? 0.22 : 0.35;
            wireMesh.material.needsUpdate = true;
        }
        if (innerCore && innerCore.material) {
            innerCore.material.color.setHex(isLightTheme ? 0xa855f7 : 0xc084fc);
            innerCore.material.opacity = isLightTheme ? 0.3 : 0.45;
            innerCore.material.needsUpdate = true;
        }
    }

    function animate() {
        animationFrameId = requestAnimationFrame(animate);

        if (!scene || !camera || !renderer) return;

        if (!isReducedMotion) {
            // Smooth mouse parallax damping
            mouseX += (targetMouseX - mouseX) * 0.04;
            mouseY += (targetMouseY - mouseY) * 0.04;

            camera.position.x += (mouseX - camera.position.x) * 0.035;
            camera.position.y += (-mouseY - camera.position.y) * 0.035;
            camera.lookAt(scene.position);

            if (particles) {
                particles.rotation.y += 0.0007;
                particles.rotation.x += 0.0003;
            }

            if (wireMesh) {
                wireMesh.rotation.x += 0.0025;
                wireMesh.rotation.y += 0.0035;
            }

            if (innerCore) {
                innerCore.rotation.x -= 0.004;
                innerCore.rotation.z += 0.002;
            }
        }

        renderer.render(scene, camera);
    }

    global.ThreeBackground = {
        init: init,
        setTheme: setTheme
    };

    // Auto-init on DOM readiness
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('webgl-bg')) init();
        });
    } else {
        if (document.getElementById('webgl-bg')) init();
    }
})(typeof window !== 'undefined' ? window : this);
