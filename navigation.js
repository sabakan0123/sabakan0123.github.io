(() => {
  const links = [...document.querySelectorAll('.header nav a[href^="#"]')];
  const sections = links.map(link => document.getElementById(link.hash.slice(1)));
  let queued = false;
  function update() {
    queued = false;
    const line = document.querySelector('.header').getBoundingClientRect().bottom + 120;
    let current = -1;
    sections.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= line) current = index;
    });
    links.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function request() {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }
  addEventListener('scroll', request, {passive: true});
  addEventListener('resize', request);
  addEventListener('load', request);
  update();
})();
