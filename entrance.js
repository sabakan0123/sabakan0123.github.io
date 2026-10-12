'use strict';
(() => {
  const entrance = document.querySelector('#entrance'), canvas = document.querySelector('#entrance-canvas'), skip = document.querySelector('#entrance-skip');
  const ctx = canvas.getContext('2d'), reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const page = [...document.querySelectorAll('body > header, body > main, body > footer, body > .skip, body > .artwork-credits')];
  const paw = new Image(), painting = new Image();
  let done = false, running = false, raf = 0, start = 0, w = 0, h = 0, keyboard = false, paper;
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => { n = clamp(n); return n * n * (3 - 2 * n); };
  const finish = () => {
    if (done) return;
    done = true; cancelAnimationFrame(raf); clearTimeout(safety); entrance.hidden = true;
    document.documentElement.classList.remove('entering'); page.forEach(node => { node.inert = false; });
    if (keyboard) document.querySelector('.wordmark').focus({ preventScroll: true });
    document.dispatchEvent(new Event('garden-entered'));
    window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', visibility);
  };
  const safety = setTimeout(finish, 9500);
  function visibility() { if (document.hidden) finish(); }
  if (!ctx || reduced.matches || location.hash) { finish(); return; }
  function makePaper() {
    const tile = document.createElement('canvas'); tile.width = tile.height = 256;
    const c = tile.getContext('2d'), data = c.createImageData(256, 256);
    let seed = 3947;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      const weave = Math.sin(x * Math.PI / 2) * (1.7 + Math.sin(y * .39)) + Math.cos(y * Math.PI / 2) * 1.7;
      const value = 249 + weave + random() * 6 - 3, i = (y * 256 + x) * 4;
      data.data[i] = value; data.data[i + 1] = value - .5; data.data[i + 2] = value - 2; data.data[i + 3] = 255;
    }
    c.putImageData(data, 0, 0); c.lineWidth = .45;
    for (let i = 0; i < 500; i++) {
      const x = random() * 256, y = random() * 256; c.strokeStyle = i % 2 ? '#fff9' : '#8e897512';
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + random() * 9, y + random() * 2); c.stroke();
    }
    return ctx.createPattern(tile, 'repeat');
  }
  function resize() {
    w = innerWidth; h = innerHeight; const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paper = makePaper(); base();
  }
  function base() {
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = paper; ctx.fillRect(0, 0, w, h);
    const light = ctx.createRadialGradient(w * .32, h * .22, 0, w * .5, h * .5, Math.hypot(w, h));
    light.addColorStop(0, '#ffffff45'); light.addColorStop(1, '#b9b19d24'); ctx.fillStyle = light; ctx.fillRect(0, 0, w, h);
  }
  const pawWidth = () => Math.min(1050, Math.max(520, w * .83));
  const spacing = () => pawWidth() * .086;
  function scratchY(i, x) {
    return h * .39 + (i - 1.5) * spacing() + (1 - x / w) * h * .045 + Math.sin(x * .22 + i * 7) * 1.1 + Math.sin(x * .61 + i) * .65;
  }
  function boundary(i, x) { return i < 0 ? -80 : i > 3 ? h + 80 : scratchY(i, x); }
  function bandPath(i, left, right) {
    ctx.beginPath();
    for (let x = left; x <= right; x += 5) ctx.lineTo(x, boundary(i - 1, x));
    ctx.lineTo(right, boundary(i - 1, right));
    for (let x = right; x >= left; x -= 5) ctx.lineTo(x, boundary(i, x));
    ctx.closePath();
  }
  function drawScratches(progress, opening) {
    const left = w * (.86 - progress * .72), right = w * .86;
    if (!progress) return;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); for (let x = right; x >= left; x -= 3) ctx.lineTo(x, scratchY(i, x));
      ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.2 + opening * (5 + i % 2 * 2); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.translate(0, -1.6 - opening * 3); ctx.strokeStyle = '#ffffffc0'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
      ctx.strokeStyle = '#908b7c75'; ctx.lineWidth = .6;
      for (let x = left + 6; x < right; x += 11) {
        const y = scratchY(i, x), length = 2 + Math.sin(x * 2) * 1.5;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + length * 1.5, y - length); ctx.stroke();
      }
    }
  }
  function peelStrip(i, progress) {
    if (progress <= 0) return;
    const fold = w + 110 - smooth(progress) * (w + 280);
    const top = boundary(i - 1, fold), bottom = boundary(i, fold);
    const curl = Math.min(105, w * .13) * Math.sin(Math.PI * Math.min(progress, .85));
    ctx.save(); bandPath(i, -200, w + 200); ctx.clip();
    ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; ctx.fillRect(fold, -100, w + 300, h + 200);
    ctx.globalCompositeOperation = 'source-over';
    const shadow = ctx.createLinearGradient(fold - 5, 0, fold + curl + 30, 0);
    shadow.addColorStop(0, '#34332955'); shadow.addColorStop(.48, '#34332926'); shadow.addColorStop(1, '#34332900');
    ctx.fillStyle = shadow; ctx.fillRect(fold - 5, top, curl + 35, bottom - top);
    const roll = ctx.createLinearGradient(fold - 5, 0, fold + curl, 0);
    roll.addColorStop(0, '#c1bbab'); roll.addColorStop(.17, '#e3ded0'); roll.addColorStop(.5, '#fffffa'); roll.addColorStop(.82, '#f4f0e7'); roll.addColorStop(1, '#a9a28f');
    ctx.beginPath(); ctx.moveTo(fold - 2, top);
    ctx.bezierCurveTo(fold + curl * .9, top - 7, fold + curl, top + 12, fold + curl, top + 25);
    ctx.lineTo(fold + curl, bottom - 17); ctx.quadraticCurveTo(fold + curl * .7, bottom + 5, fold - 2, bottom); ctx.closePath(); ctx.fillStyle = roll; ctx.fill();
    ctx.strokeStyle = '#fff9'; ctx.lineWidth = .65;
    for (let y = top; y < bottom; y += 4) { ctx.beginPath(); ctx.moveTo(fold + curl * .4, y); ctx.lineTo(fold + curl * .83, y + .4); ctx.stroke(); }
    ctx.restore();
  }
  function draw(now) {
    if (done) return; if (!start) start = now;
    const t = (now - start) / 1000, entry = smooth(t / .6), scratch = smooth((t - .65) / 1.2), retreat = smooth((t - 2) / .65);
    base(); drawScratches(scratch, smooth((t - 1.7) / .8));
    for (let i = 0; i < 5; i++) peelStrip(i, clamp((t - 2.4 - [0.24, .1, 0, .16, .3][i]) / 2.4));
    if (retreat < 1) {
      const pw = pawWidth(), ph = pw * .5, tip = w * (1.06 - entry * .2 - scratch * .72 + retreat * 1.25);
      const py = h * .39 - ph * .49 + (1 - tip / w) * h * .045;
      ctx.save(); ctx.shadowColor = '#29251935'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 12;
      const left = tip - pw * .05, end = left + pw;
      if (end < w + 30) ctx.drawImage(paw, paw.naturalWidth - 5, 0, 5, paw.naturalHeight, end - 2, py, w + 32 - end, ph);
      ctx.drawImage(paw, left, py, pw, ph); ctx.restore();
    }
    entrance.classList.toggle('tearing', t > 2.35);
    entrance.dataset.phase = t < .65 ? 'arriving' : t < 2 ? 'scratching' : t < 2.7 ? 'lifting' : 'peeling';
    if (t >= 5.35) { finish(); return; } raf = requestAnimationFrame(draw);
  }
  function begin() {
    if (done || running || !paw.complete || !paw.naturalWidth || !painting.complete || !painting.naturalWidth) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    running = true; raf = requestAnimationFrame(draw);
  }
  entrance.hidden = false; document.documentElement.classList.add('entering'); page.forEach(node => { node.inert = true; });
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  skip.addEventListener('click', () => { keyboard = true; finish(); });
  document.addEventListener('keydown', event => {
    if (done) return;
    if (event.key === 'Tab') { keyboard = true; skip.focus({ preventScroll: true }); event.preventDefault(); }
    if (event.key === 'Escape') { keyboard = true; finish(); }
  });
  reduced.addEventListener('change', event => { if (event.matches) finish(); });
  window.addEventListener('resize', resize); document.addEventListener('visibilitychange', visibility);
  resize(); paw.onload = painting.onload = begin; paw.onerror = painting.onerror = finish;
  paw.src = 'assets/tuxedo-paw.webp'; painting.src = 'assets/monet-agapanthus.webp';
})();
