/**
 * ThreeBackground — Reusable 3D Particle Constellation
 * Optimized for performance: ~1200 particles, mouse parallax, smooth rotation,
 * dynamic theme adaptation, devicePixelRatio capping (<=2), and prefers-reduced-motion support.
 */
(function (global) {
    let scene, camera, renderer, particles, geometry, material;
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    let isLightTheme = false;
    let isReducedMotion = false;
    let isInitialized = false;

    function init(canvasId = 'webgl-bg', options = {}) {
        if (isInitialized) return;

        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            return;
        }

        if (typeof THREE === 'undefined') {
            console.warn('[ThreeBackground] THREE.js library not found.');
            return;
        }

        // Detect user motion preference
        if (window.matchMedia) {
            isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
                isReducedMotion = e.matches;
            });
        }

        // Detect current theme
        const currentTheme = document.documentElement.getAttribute('data-theme') || 
                             document.body.getAttribute('data-theme') || 
                             'dark';
        isLightTheme = (currentTheme === 'light');

        try {
            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                1,
                2000
            );
            camera.position.z = 1000;

            geometry = new THREE.BufferGeometry();
            const vertices = [];
            const particleCount = options.particleCount || 1200;

            for (let i = 0; i < particleCount; i++) {
                const x = (Math.random() - 0.5) * 2400;
                const y = (Math.random() - 0.5) * 2400;
                const z = (Math.random() - 0.5) * 2400;
                vertices.push(x, y, z);
            }

            geometry.setAttribute(
                'position',
                new THREE.Float32BufferAttribute(vertices, 3)
            );

            material = new THREE.PointsMaterial({
                color: isLightTheme ? 0x4f46e5 : 0x818cf8,
                size: options.particleSize || 5.5,
                transparent: true,
                opacity: isLightTheme ? 0.65 : 0.75,
                blending: isLightTheme ? THREE.NormalBlending : THREE.AdditiveBlending
            });

            particles = new THREE.Points(geometry, material);
            scene.add(particles);

            renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance'
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.setSize(window.innerWidth, window.innerHeight);

            // Passive listeners
            document.addEventListener('mousemove', onMouseMove, { passive: true });
            window.addEventListener('resize', onResize, { passive: true });

            isInitialized = true;
            animate();
        } catch (err) {
            console.warn('[ThreeBackground] WebGL initialization failed (fallback to CSS background):', err);
        }
    }

    function onMouseMove(event) {
        targetMouseX = (event.clientX - window.innerWidth / 2) * 0.35;
        targetMouseY = (event.clientY - window.innerHeight / 2) * 0.35;
    }

    function onResize() {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function setTheme(theme) {
        isLightTheme = (theme === 'light');
        if (material) {
            material.color.setHex(isLightTheme ? 0x4f46e5 : 0x818cf8);
            material.opacity = isLightTheme ? 0.65 : 0.75;
            material.blending = isLightTheme ? THREE.NormalBlending : THREE.AdditiveBlending;
            material.needsUpdate = true;
        }
    }

    function animate() {
        requestAnimationFrame(animate);

        if (!scene || !camera || !renderer) return;

        if (!isReducedMotion) {
            mouseX += (targetMouseX - mouseX) * 0.035;
            mouseY += (targetMouseY - mouseY) * 0.035;

            camera.position.x += (mouseX - camera.position.x) * 0.03;
            camera.position.y += (-mouseY - camera.position.y) * 0.03;
            camera.lookAt(scene.position);

            if (particles) {
                particles.rotation.x += 0.0006;
                particles.rotation.y += 0.0009;
            }
        }

        renderer.render(scene, camera);
    }

    global.ThreeBackground = {
        init: init,
        setTheme: setTheme
    };

    // Auto-initialize if canvas is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('webgl-bg')) init();
        });
    } else {
        if (document.getElementById('webgl-bg')) init();
    }
})(typeof window !== 'undefined' ? window : this);
