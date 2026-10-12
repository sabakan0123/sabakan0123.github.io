'use strict';
(() => {
  const entrance = document.querySelector('#entrance');
  const canvas = document.querySelector('#entrance-canvas');
  const skip = document.querySelector('#entrance-skip');
  const context = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const page = [...document.querySelectorAll('body > header, body > main, body > footer, body > .skip')];
  let finished = false, started = false, raf = 0, start = 0, width = 0, height = 0;
  let focused = false;
  const cat = new Image();
  const painting = new Image();
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => 1 - Math.pow(1 - clamp(value), 3);
  const finish = () => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    clearTimeout(failsafe);
    entrance.hidden = true;
    document.documentElement.classList.remove('entering');
    page.forEach(element => { element.inert = false; });
    if (focused) {
      document.querySelector('.wordmark').focus({ preventScroll: true });
    }
    document.dispatchEvent(new Event('garden-entered'));
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', visibility);
  };
  // The portfolio remains usable if images, canvas or JavaScript fail to load.
  const failsafe = setTimeout(finish, 8500);
  function resize() {
    width = innerWidth; height = innerHeight;
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
  }
  function visibility() { if (document.hidden) finish(); }
  if (!context || reduced.matches || location.hash) { finish(); return; }
  entrance.hidden = false;
  document.documentElement.classList.add('entering');
  page.forEach(element => { element.inert = true; });
  skip.focus({ preventScroll: true });
  skip.addEventListener('click', () => { focused = true; finish(); });
  entrance.addEventListener('keydown', event => { if (event.key === 'Escape') { focused = true; finish(); } });
  reduced.addEventListener('change', event => { if (event.matches) finish(); });
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', visibility);
  resize();
  drawPaper();

  // Stable ragged edge: the same paper fibers spread apart as the opening grows.
  const rim = Array.from({ length: 80 }, (_, i) => {
    const angle = i / 80 * Math.PI * 2;
    const rough = 1 + Math.sin(i * 19.3) * .075 + Math.sin(i * 7.1) * .035;
    return { x: Math.cos(angle) * rough, y: Math.sin(angle) * rough };
  });
  function hole(radius, x, y) {
    context.beginPath();
    rim.forEach((point, i) => {
      const px = x + point.x * radius, py = y + point.y * radius * 1.23;
      if (i === 0) context.moveTo(px, py); else context.lineTo(px, py);
    });
    context.closePath();
  }
  function drawPaper() {
    context.fillStyle = '#fff'; context.fillRect(0, 0, width, height);
    // Very fine linen weave, deliberately near white.
    context.strokeStyle = 'rgba(84,79,64,.022)'; context.lineWidth = .5;
    context.beginPath();
    for (let x = 0; x < width; x += 5) { context.moveTo(x, 0); context.lineTo(x, height); }
    for (let y = 0; y < height; y += 5) { context.moveTo(0, y); context.lineTo(width, y); }
    context.stroke();
  }
  function draw(now) {
    if (finished) return;
    if (!start) start = now;
    const t = (now - start) / 1000;
    context.clearRect(0, 0, width, height);
    drawPaper();
    const size = Math.min(280, Math.max(175, width * .21));
    const cx = width * .5, cy = height * .46;
    const walking = t < 2.5;
    const jump = clamp((t - 2.85) / .62);
    const tearing = clamp((t - 3.44) / 1.4);
    let x = width + size * .3 - (width * .5 + size * .3) * clamp(t / 2.5);
    let y = height * .67 - size * .83;
    let frame = walking ? [0, 1, 2, 3][Math.floor(t * 8) % 4] : t < 2.85 ? 4 : 5;
    if (walking) y += Math.sin(t * Math.PI * 16) * 1.5;
    if (jump > 0) {
      // Forepaws meet the canvas at its center, then disappear through the tear.
      x += size * .22 * ease(jump);
      y += (cy - size * .05 - y) * ease(jump);
    }
    if (t > 3.25 && tearing === 0) {
      const amount = clamp((t - 3.25) / .19);
      context.strokeStyle = '#77796c'; context.lineWidth = 1.1;
      for (let i = 0; i < 3; i++) {
        context.beginPath(); context.moveTo(cx - 18 + i * 12, cy - 24);
        context.lineTo(cx - 24 + i * 12, cy - 24 + amount * 62);
        context.stroke();
      }
    }
    if (tearing > 0) {
      const radius = 8 + Math.hypot(width, height) * .68 * Math.pow(tearing, 1.55);
      context.save();
      context.globalCompositeOperation = 'destination-out';
      hole(radius, cx, cy); context.fill();
      context.restore();
      // Soft undersides and little angular folds make this a canvas tear, not a wipe.
      hole(radius, cx, cy);
      context.strokeStyle = 'rgba(154,149,128,.32)'; context.lineWidth = 2; context.stroke();
      for (let i = 0; i < 18; i++) {
        const a = i / 18 * Math.PI * 2;
        const r = radius * (1 + Math.sin(i * 9) * .06);
        context.save();
        context.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 1.23);
        context.rotate(a + tearing * 1.2);
        context.fillStyle = i % 2 ? '#eceae3' : '#faf9f5';
        context.shadowColor = '#3f493633'; context.shadowBlur = 8;
        const length = Math.min(58, radius * .26);
        context.beginPath(); context.moveTo(0, -12); context.lineTo(-length, 0); context.lineTo(5, 20); context.closePath(); context.fill();
        context.restore();
      }
    }
    if (tearing < .23) {
      context.save();
      context.globalAlpha = 1 - clamp(tearing / .23);
      const scale = 1 - tearing * 1.8;
      context.translate(x, y + size / 2); context.scale(scale, scale);
      // The leap cell has a neighboring tail tip in its left margin; exclude that margin.
      const inset = frame === 5 ? 44 : 0;
      context.drawImage(cat, (frame % 3) * 512 + inset, Math.floor(frame / 3) * 512, 512 - inset, 512, -size / 2 + size * inset / 512, -size / 2, size * (512 - inset) / 512, size);
      context.restore();
    }
    entrance.classList.toggle('tearing', tearing > 0);
    entrance.dataset.phase = walking ? 'walking' : t < 2.85 ? 'crouching' : tearing ? 'tearing' : 'jumping';
    if (t >= 4.95) { finish(); return; }
    raf = requestAnimationFrame(draw);
  }
  function begin() {
    if (started || finished || !cat.complete || !cat.naturalWidth || !painting.complete || !painting.naturalWidth) return;
    started = true; raf = requestAnimationFrame(draw);
  }
  cat.onload = painting.onload = begin;
  cat.onerror = painting.onerror = finish;
  cat.src = 'assets/tuxedo-motion.webp';
  painting.src = 'assets/watergarden-shorthair.webp';
})();
