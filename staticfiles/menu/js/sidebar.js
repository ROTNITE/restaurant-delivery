// Боковое меню (гамбургер)
window.addEventListener('DOMContentLoaded', () => {
    const hamb = document.getElementById('hamburger');
    const side = document.getElementById('side-menu');
    if (!hamb || !side) return;
    hamb.addEventListener('mouseenter', () => side.classList.add('open'));
    side.addEventListener('mouseenter', () => side.classList.add('open'));
    hamb.addEventListener('mouseleave', () => side.classList.remove('open'));
    side.addEventListener('mouseleave', () => side.classList.remove('open'));
    hamb.addEventListener('click', () => side.classList.toggle('open'));
    side.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => side.classList.remove('open'));
    });
  });