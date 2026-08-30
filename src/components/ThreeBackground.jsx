import React, { useEffect, useRef } from 'react';

export const ThreeBackground = ({ theme = 'dark' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let scene, camera, renderer, particles, geometry, material;
    let animationFrameId;
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    let onMouseMove, onResize;
    const isLight = theme === 'light';

    const setupScene = (THREE) => {
      if (!THREE || !canvas) return;

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
        const particleCount = 1200;

        for (let i = 0; i < particleCount; i++) {
          vertices.push(
            (Math.random() - 0.5) * 2400,
            (Math.random() - 0.5) * 2400,
            (Math.random() - 0.5) * 2400
          );
        }

        geometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(vertices, 3)
        );

        material = new THREE.PointsMaterial({
          color: isLight ? 0x4f46e5 : 0x818cf8,
          size: 5.5,
          transparent: true,
          opacity: isLight ? 0.65 : 0.75,
          blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending
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

        onMouseMove = (event) => {
          targetMouseX = (event.clientX - window.innerWidth / 2) * 0.35;
          targetMouseY = (event.clientY - window.innerHeight / 2) * 0.35;
        };

        onResize = () => {
          if (!camera || !renderer) return;
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });

        const animate = () => {
          animationFrameId = requestAnimationFrame(animate);

          mouseX += (targetMouseX - mouseX) * 0.035;
          mouseY += (targetMouseY - mouseY) * 0.035;

          camera.position.x += (mouseX - camera.position.x) * 0.03;
          camera.position.y += (-mouseY - camera.position.y) * 0.03;
          camera.lookAt(scene.position);

          if (particles) {
            particles.rotation.x += 0.0006;
            particles.rotation.y += 0.0009;
          }

          renderer.render(scene, camera);
        };

        animate();
      } catch (err) {
        console.warn('[ThreeBackground] WebGL initialization error:', err);
      }
    };

    if (typeof window.THREE === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.async = true;
      script.onload = () => setupScene(window.THREE);
      document.head.appendChild(script);
    } else {
      setupScene(window.THREE);
    }

    return () => {
      if (onMouseMove) window.removeEventListener('mousemove', onMouseMove);
      if (onResize) window.removeEventListener('resize', onResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (renderer) renderer.dispose();
      if (geometry) geometry.dispose();
      if (material) material.dispose();
    };
  }, [theme]);

  return (
    <canvas
      id="webgl-bg"
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};
