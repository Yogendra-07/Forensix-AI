/* ═══════════════════════════════════════════════════
   FORENSIX AI — MAIN SCRIPT
   File: js/main.js
   Handles: cursor, counter animation, nav scroll
   ═══════════════════════════════════════════════════ */

/* ── Custom Cursor ───────────────────────────────── */
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let mx=0, my=0, rx=0, ry=0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.left = (mx - 6)  + 'px';
  cursor.style.top  = (my - 6)  + 'px';
});

// Smooth trailing ring
setInterval(() => {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  cursorRing.style.left = (rx - 18) + 'px';
  cursorRing.style.top  = (ry - 18) + 'px';
}, 16);

// Scale ring on hover over interactive elements
document.querySelectorAll('a, button, .archive-item, .sel-btn, .cta-btn').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorRing.style.transform = 'scale(1.8)';
    cursorRing.style.borderColor = 'rgba(255,60,110,0.6)';
  });
  el.addEventListener('mouseleave', () => {
    cursorRing.style.transform = 'scale(1)';
    cursorRing.style.borderColor = 'rgba(0,255,170,0.5)';
  });
});

/* ── Hero Counter Animation ──────────────────────── */
function animateCounter(el, target, suffix='', duration=2200) {
  let current = 0;
  const increment = target / (duration / 16);
  const interval  = setInterval(() => {
    current = Math.min(current + increment, target);
    el.textContent = Math.floor(current).toLocaleString() + suffix;
    if (current >= target) clearInterval(interval);
  }, 16);
}

window.addEventListener('load', () => {
  setTimeout(() => {
    animateCounter(document.getElementById('c1'), 14720);
    animateCounter(document.getElementById('c2'), 2847);
    animateCounter(document.getElementById('c3'), 12, 'B');
    animateCounter(document.getElementById('c4'), 94, '%');
  }, 1000);
});

/* ── Nav active link on scroll ───────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === '#' + entry.target.id
          ? 'var(--accent)'
          : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => observer.observe(s));

/* ── Nav background opacity on scroll ───────────── */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 80) {
    nav.style.background = 'rgba(5,10,15,0.97)';
  } else {
    nav.style.background = 'rgba(5,10,15,0.88)';
  }
});
