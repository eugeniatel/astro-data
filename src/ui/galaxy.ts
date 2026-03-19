// src/ui/galaxy.ts
// Animated particle network for the landing page.
// Blue-toned galaxy blob, moves slowly like a medusa/jellyfish.

export function createGalaxy(container: HTMLElement): { destroy: () => void } {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '0';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;
  let animId = 0;
  let time = 0;

  const PARTICLE_COUNT = 350;
  const CONNECTION_DIST = 150;

  interface Particle {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    radius: number;
    phase: number;
    speed: number;
    color: string;
    glow: boolean;
  }

  let particles: Particle[] = [];
  let w = 0;
  let h = 0;

  function resize() {
    w = canvas.width = container.clientWidth;
    h = canvas.height = container.clientHeight;
    initParticles();
  }

  function initParticles() {
    particles = [];
    const cx = w / 2;
    const cy = h / 2;
    const spread = Math.min(w, h) * 0.45;

    // Blue shades palette
    const colors = [
      'rgba(30, 80, 200, 0.9)',    // deep blue
      'rgba(50, 120, 240, 0.8)',   // bright blue
      'rgba(70, 140, 255, 0.7)',   // sky blue
      'rgba(20, 60, 160, 0.8)',    // navy
      'rgba(100, 160, 255, 0.6)',  // light blue
      'rgba(40, 100, 220, 0.7)',   // medium blue
      'rgba(80, 180, 255, 0.5)',   // pale blue
      'rgba(30, 50, 140, 0.9)',    // dark navy
      'rgba(120, 200, 255, 0.4)',  // ice blue
      'rgba(60, 90, 200, 0.8)',    // royal blue
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      // More organic distribution: multiple overlapping gaussian clusters
      const cluster = Math.random();
      let dist: number;
      if (cluster < 0.6) {
        dist = (Math.random() + Math.random()) * 0.5 * spread;
      } else if (cluster < 0.85) {
        dist = (Math.random() * 0.3 + 0.5) * spread;
      } else {
        dist = (Math.random() * 0.2 + 0.7) * spread;
      }

      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;

      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        radius: Math.random() * 2 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.004 + 0.001,
        color: colors[Math.floor(Math.random() * colors.length)],
        glow: Math.random() < 0.03,
      });
    }
  }

  function draw() {
    time += 1;
    ctx.clearRect(0, 0, w, h);

    // Update particles
    for (const p of particles) {
      const drift = Math.sin(time * p.speed + p.phase) * 25;
      const driftY = Math.cos(time * p.speed * 0.7 + p.phase) * 18;
      p.x = p.baseX + drift + Math.sin(time * 0.002 + p.phase) * 12;
      p.y = p.baseY + driftY + Math.cos(time * 0.003 + p.phase) * 8;

      // Slow global rotation
      const cx = w / 2;
      const cy = h / 2;
      const dx = p.baseX - cx;
      const dy = p.baseY - cy;
      const rotSpeed = 0.00008;
      p.baseX = cx + dx * Math.cos(rotSpeed) - dy * Math.sin(rotSpeed);
      p.baseY = cy + dx * Math.sin(rotSpeed) + dy * Math.cos(rotSpeed);
    }

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(80, 140, 255, ${alpha})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (const p of particles) {
      if (p.glow) {
        // Bright glow points (like the white dots in the reference)
        const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8);
        glowGrad.addColorStop(0, 'rgba(200, 220, 255, 0.8)');
        glowGrad.addColorStop(0.3, 'rgba(120, 160, 255, 0.3)');
        glowGrad.addColorStop(1, 'rgba(60, 100, 200, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(p.x - 8, p.y - 8, 16, 16);
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    // Deep blue ambient glow at center
    const glow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) * 0.4);
    glow.addColorStop(0, 'rgba(30, 60, 160, 0.06)');
    glow.addColorStop(0.4, 'rgba(20, 50, 140, 0.04)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();

  return {
    destroy() {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.remove();
    },
  };
}
