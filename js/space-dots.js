/**
 * Subhan DevSphere - Space Light Dots & Orbiting Stars Engine
 * Inspired by modern luxury cosmic portfolios (e.g. aakashgugilla.is-a.dev)
 * 
 * Features:
 * - Glowing light dots & stars orbiting in graceful cosmic paths
 * - Luminous multi-colored glows (Cyan, Electric Lilac, Celestial Gold, Emerald, Ice White)
 * - Smooth 60/120fps hardware-accelerated 2D canvas
 * - Responsive viewport resizing with Retina/HiDPI support
 * - Subtle ethereal constellation lines between close orbiting dots
 * - Soft mouse-reactive parallax drift without blocking clicks (pointer-events: none)
 */

(function () {
  'use strict';

  let canvas = null;
  let ctx = null;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationFrameId = null;
  let particles = [];
  let mouse = { x: -9999, y: -9999, targetX: -9999, targetY: -9999 };

  // Curated luxury light colors
  const COLOR_PALETTE = [
    { core: '#ffffff', glow: 'rgba(56, 189, 248, ', line: 'rgba(56, 189, 248, ' },    // Cyan
    { core: '#ffffff', glow: 'rgba(192, 132, 252, ', line: 'rgba(192, 132, 252, ' },  // Electric Lilac
    { core: '#fffdf0', glow: 'rgba(250, 204, 21, ', line: 'rgba(250, 204, 21, ' },    // Celestial Gold
    { core: '#f0fdf4', glow: 'rgba(74, 222, 128, ', line: 'rgba(74, 222, 128, ' },    // Soft Emerald
    { core: '#ffffff', glow: 'rgba(255, 255, 255, ', line: 'rgba(224, 242, 254, ' }   // Star White
  ];

  class LightDot {
    constructor(w, h) {
      this.reset(w, h, true);
    }

    reset(w, h, initial = false) {
      // Anchor center for orbital rotation
      this.centerX = initial ? Math.random() * w : (Math.random() > 0.5 ? -40 : w + 40);
      this.centerY = Math.random() * h;

      // Linear drift velocity
      const driftSpeed = 0.15 + Math.random() * 0.35;
      const driftAngle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(driftAngle) * driftSpeed;
      this.vy = Math.sin(driftAngle) * driftSpeed;

      // Orbital rotation ("tara dots ghoom raha ha")
      this.orbitRadiusX = 25 + Math.random() * 75;
      this.orbitRadiusY = 18 + Math.random() * 55;
      this.orbitAngle = Math.random() * Math.PI * 2;
      this.orbitSpeed = (0.004 + Math.random() * 0.012) * (Math.random() > 0.5 ? 1 : -1);

      // Particle visual sizing
      this.radius = 1.0 + Math.random() * 2.2;
      this.glowRadius = this.radius * (4.5 + Math.random() * 4.0);

      // Color scheme
      this.color = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

      // Twinkle & pulse brightness
      this.baseAlpha = 0.45 + Math.random() * 0.5;
      this.pulseSpeed = 0.015 + Math.random() * 0.035;
      this.pulsePhase = Math.random() * Math.PI * 2;

      // Depth layer for 3D parallax
      this.depth = 0.4 + Math.random() * 0.8;

      // Actual current position
      this.x = this.centerX + Math.cos(this.orbitAngle) * this.orbitRadiusX;
      this.y = this.centerY + Math.sin(this.orbitAngle) * this.orbitRadiusY;
    }

    update(w, h, mouseX, mouseY) {
      // 1. Progress orbital revolution
      this.orbitAngle += this.orbitSpeed;

      // 2. Drift center point across canvas
      this.centerX += this.vx * this.depth;
      this.centerY += this.vy * this.depth;

      // Screen boundary wrapping
      const padding = 100;
      if (this.centerX < -padding) this.centerX = w + padding;
      else if (this.centerX > w + padding) this.centerX = -padding;
      if (this.centerY < -padding) this.centerY = h + padding;
      else if (this.centerY > h + padding) this.centerY = -padding;

      // 3. Compute orbiting coordinate
      let targetX = this.centerX + Math.cos(this.orbitAngle) * this.orbitRadiusX;
      let targetY = this.centerY + Math.sin(this.orbitAngle) * this.orbitRadiusY;

      // 4. Subtle mouse reactive drift
      if (mouseX > 0 && mouseY > 0) {
        const dx = targetX - mouseX;
        const dy = targetY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 160;
        if (dist < maxDist && dist > 1) {
          const force = (1 - dist / maxDist) * 18 * this.depth;
          targetX += (dx / dist) * force;
          targetY += (dy / dist) * force;
        }
      }

      this.x = targetX;
      this.y = targetY;

      // 5. Update pulse
      this.pulsePhase += this.pulseSpeed;
    }

    draw(context) {
      const alpha = Math.max(0.15, Math.min(1.0, this.baseAlpha + Math.sin(this.pulsePhase) * 0.35));

      // Luminous radial glow halo
      const glowGrad = context.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.glowRadius
      );
      glowGrad.addColorStop(0, this.color.glow + (alpha * 0.95) + ')');
      glowGrad.addColorStop(0.35, this.color.glow + (alpha * 0.45) + ')');
      glowGrad.addColorStop(1, this.color.glow + '0)');

      context.beginPath();
      context.arc(this.x, this.y, this.glowRadius, 0, Math.PI * 2);
      context.fillStyle = glowGrad;
      context.fill();

      // Sharp central star core
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      context.fillStyle = this.color.core;
      context.shadowColor = this.color.glow + '0.8)';
      context.shadowBlur = 8;
      context.fill();
      context.shadowBlur = 0; // reset
    }
  }

  function initSpaceDots() {
    canvas = document.getElementById('space-dots-canvas');
    if (!canvas) {
      // Auto-create canvas if not found in HTML
      canvas = document.createElement('canvas');
      canvas.id = 'space-dots-canvas';
      document.body.insertBefore(canvas, document.body.firstChild);
    }

    ctx = canvas.getContext('2d');
    if (!ctx) return;

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Track mouse movement
    window.addEventListener('mousemove', (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouse.targetX = -9999;
      mouse.targetY = -9999;
    });

    // Touch support for mobiles
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      mouse.targetX = -9999;
      mouse.targetY = -9999;
    });

    // Pause when tab not visible to save CPU/battery
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      } else {
        animate();
      }
    });

    // Start rendering loop
    animate();
  }

  function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Adjust particle count according to screen size
    const targetCount = width < 768 ? 45 : 85;
    if (particles.length === 0) {
      for (let i = 0; i < targetCount; i++) {
        particles.push(new LightDot(width, height));
      }
    } else if (particles.length < targetCount) {
      while (particles.length < targetCount) {
        particles.push(new LightDot(width, height));
      }
    } else if (particles.length > targetCount) {
      particles = particles.slice(0, targetCount);
    }
  }

  function animate() {
    if (!ctx || !canvas) return;

    // Smooth mouse interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.1;
    mouse.y += (mouse.targetY - mouse.y) * 0.1;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Additive glow blending mode for true cosmic light intensity
    ctx.globalCompositeOperation = 'lighter';

    // 1. Draw subtle ethereal constellation connection lines
    const maxConnDist = 95;
    const pLen = particles.length;
    for (let i = 0; i < pLen; i++) {
      const pi = particles[i];
      for (let j = i + 1; j < pLen; j++) {
        const pj = particles[j];
        const dx = pi.x - pj.x;
        const dy = pi.y - pj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxConnDist) {
          const lineAlpha = (1 - dist / maxConnDist) * 0.18 * Math.min(pi.baseAlpha, pj.baseAlpha);
          ctx.beginPath();
          ctx.moveTo(pi.x, pi.y);
          ctx.lineTo(pj.x, pj.y);
          ctx.strokeStyle = pi.color.line + lineAlpha + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // 2. Update and draw each glowing light dot
    for (let i = 0; i < pLen; i++) {
      const p = particles[i];
      p.update(width, height, mouse.x, mouse.y);
      p.draw(ctx);
    }

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';

    animationFrameId = requestAnimationFrame(animate);
  }

  // Auto-boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpaceDots);
  } else {
    initSpaceDots();
  }

  // Export for external trigger
  window.SpaceDotsEngine = {
    init: initSpaceDots,
    resize: resize
  };
})();
