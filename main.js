/**
 * main.js — Portfolio interactions
 *
 * 1. Nav — scroll shadow on glassmorphism pill
 * 2. Nav — active section tracking via scroll position (reliable for all section heights)
 * 3. Scroll reveal — sections fade in, children stagger
 * 4. Hero echo — subtle mouse parallax
 * 5. Smooth scroll — accounts for fixed nav height offset
 */

/* ============================================================
   1. NAV — Scrolled shadow
   ============================================================ */

const nav = document.getElementById('main-nav');

window.addEventListener('scroll', () => {
  nav.style.boxShadow = window.scrollY > 24
    ? '0 8px 36px rgba(59,94,63,0.14)'
    : '';
}, { passive: true });

/* ============================================================
   2. NAV — Active section via scroll position
   Works reliably for sections of any height.
   ============================================================ */

const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const sections  = Array.from(document.querySelectorAll('section[id]'));

// Map section id → nav <a> element (only tracked sections)
const navMap = {
  about:      document.getElementById('nav-about'),
  experience: document.getElementById('nav-experience'),
  projects:   document.getElementById('nav-projects'),
  research:   document.getElementById('nav-research'),
  skills:     document.getElementById('nav-skills'),
  contact:    document.getElementById('nav-contact'),
};

// Sections that have a dark background — nav text should go light
const darkSections = new Set(['contact']);

function setActiveNav(id) {
  navLinks.forEach(l => l.classList.remove('active'));
  const link = navMap[id];
  if (link) link.classList.add('active');

  // Toggle light text when over a dark section
  if (darkSections.has(id)) {
    nav.classList.add('on-dark');
  } else {
    nav.classList.remove('on-dark');
  }
}

function updateActiveNav() {
  // NAV_HEIGHT + small buffer so the section activates just before it reaches the top
  const trigger = window.scrollY + 120;
  let activeId = null;

  sections.forEach(section => {
    if (section.offsetTop <= trigger) {
      activeId = section.id;
    }
  });

  if (activeId) setActiveNav(activeId);
}

// Run on scroll and on load
window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

/* ============================================================
   3. SCROLL REVEAL — sections + staggered children
   ============================================================ */

const revealEls    = Array.from(document.querySelectorAll('.reveal'));
const revealChilds = Array.from(document.querySelectorAll('.reveal-child'));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      sectionObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => sectionObserver.observe(el));

// Stagger .reveal-child by their sibling index
const childObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const siblings = Array.from(
        el.parentElement.querySelectorAll('.reveal-child')
      );
      const delay = siblings.indexOf(el) * 90;
      setTimeout(() => el.classList.add('visible'), delay);
      childObserver.unobserve(el);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

revealChilds.forEach(el => childObserver.observe(el));

/* ============================================================
   4. HERO ECHO — Lazy mouse parallax
   ============================================================ */

const heroEcho    = document.getElementById('hero-echo');
const heroSection = document.getElementById('hero');

if (heroEcho && heroSection) {
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  const LERP = 0.06;
  const STRENGTH = 18;

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const nx = (e.clientX - rect.left)  / rect.width  - 0.5;
    const ny = (e.clientY - rect.top)   / rect.height - 0.5;
    targetX = -nx * STRENGTH;
    targetY = -ny * STRENGTH * 0.5;
  });

  heroSection.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
  });

  (function animate() {
    currentX += (targetX - currentX) * LERP;
    currentY += (targetY - currentY) * LERP;
    heroEcho.style.transform =
      `translate(calc(-52% + ${currentX}px), calc(-52% + ${currentY}px)) rotate(-6deg)`;
    requestAnimationFrame(animate);
  })();
}

/* ============================================================
   5. SMOOTH SCROLL — offset for fixed nav height
   ============================================================ */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href   = anchor.getAttribute('href');
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = 80; // fixed nav pill height
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
