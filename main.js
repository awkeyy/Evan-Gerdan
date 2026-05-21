/* ═══════════════════════════════════════════════════════════
   EVAN GERDAN — CV ANIMATIONS
   Uses GSAP + ScrollTrigger
═══════════════════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

/* ──────────────────────────────────────────────────────────
   1. SCROLL PROGRESS BAR
────────────────────────────────────────────────────────── */
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total    = document.body.scrollHeight - window.innerHeight;
  progressBar.style.width = (scrolled / total * 100) + '%';
});

/* ──────────────────────────────────────────────────────────
   2. NAV — switch style on scroll
────────────────────────────────────────────────────────── */
const nav = document.getElementById('nav');
ScrollTrigger.create({
  start: 'top -60',
  onEnter:      () => nav.classList.add('solid'),
  onLeaveBack:  () => nav.classList.remove('solid'),
});

/* ──────────────────────────────────────────────────────────
   3. HERO — entrance animations
────────────────────────────────────────────────────────── */
const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

heroTl
  .from('#badge',          { y: -30, opacity: 0, duration: .8 })
  .from('#hero-name',      { y: 50, opacity: 0, duration: 1,   skewX: -3 }, '-=.4')
  .from('#hero-sub',       { y: 30, opacity: 0, duration: .8 }, '-=.5')
  .from('#hero-contacts .hc-chip', {
    y: 20, opacity: 0, stagger: .1, duration: .6
  }, '-=.4')
  .from('#hero-tagline',   { y: 20, opacity: 0, duration: .7 }, '-=.3')
  .from('.scroll-indicator', { opacity: 0, duration: .8 }, '-=.2');

/* blobs continuous float already handled in CSS */

/* ──────────────────────────────────────────────────────────
   4. HERO PARALLAX on scroll
────────────────────────────────────────────────────────── */
gsap.to('#hero .hero-inner', {
  y: 120,
  ease: 'none',
  scrollTrigger: {
    trigger: '#hero',
    start: 'top top',
    end:   'bottom top',
    scrub: 1,
  }
});
gsap.to('.blob-1', {
  y: -80, x: 40,
  ease: 'none',
  scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 2 }
});
gsap.to('.blob-2', {
  y: -60, x: -30,
  ease: 'none',
  scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.5 }
});

/* ──────────────────────────────────────────────────────────
   5. STATS CARDS — staggered pop-up
────────────────────────────────────────────────────────── */
gsap.to('.stat-card', {
  y: 0, opacity: 1,
  duration: .8,
  stagger: .12,
  ease: 'back.out(1.7)',
  scrollTrigger: {
    trigger: '.stats-section',
    start: 'top 85%',
  }
});

/* counter animation */
function runCounter(el) {
  const target   = +el.dataset.target;
  const duration = target > 100 ? 2000 : 1200;
  gsap.fromTo(
    el,
    { innerText: 0 },
    {
      innerText: target,
      duration: duration / 1000,
      ease: 'power2.out',
      snap: { innerText: 1 },
      onUpdate() { el.innerText = Math.round(this.targets()[0].innerText); }
    }
  );
}
ScrollTrigger.create({
  trigger: '.stats-section',
  start: 'top 80%',
  once: true,
  onEnter: () => document.querySelectorAll('.counter').forEach(runCounter),
});

/* ──────────────────────────────────────────────────────────
   6. SECTION HEADERS — reveal animation
────────────────────────────────────────────────────────── */
document.querySelectorAll('.section-header').forEach(header => {
  const icon  = header.querySelector('.section-icon');
  const label = header.querySelector('.section-label');
  const line  = header.querySelector('.section-line');

  const tl = gsap.timeline({
    scrollTrigger: { trigger: header, start: 'top 82%', once: true }
  });
  tl.to(icon,  { opacity: 1, scale: 1, rotate: 0, duration: .6, ease: 'back.out(2)' })
    .to(label, { opacity: 1, x: 0, duration: .5, ease: 'power2.out' }, '-=.3')
    .to(line,  { scaleX: 1, duration: .7, ease: 'power2.out' }, '-=.2');
});

/* ──────────────────────────────────────────────────────────
   7. TIMELINE FILL — draws as you scroll
────────────────────────────────────────────────────────── */
const tlFill = document.querySelector('.tl-fill');
if (tlFill) {
  ScrollTrigger.create({
    trigger: '.timeline',
    start: 'top 70%',
    end:   'bottom 70%',
    scrub: .6,
    onUpdate(self) {
      tlFill.style.height = (self.progress * 100) + '%';
    }
  });
}

/* ──────────────────────────────────────────────────────────
   8. EXPERIENCE CARDS — slide in from left, staggered
────────────────────────────────────────────────────────── */
document.querySelectorAll('.tl-item').forEach((item, i) => {
  const dot  = item.querySelector('.tl-dot');
  const card = item.querySelector('.exp-card');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: item,
      start: 'top 80%',
      once: true,
    }
  });

  tl.to(dot, {
    opacity: 1, scale: 1,
    duration: .45, ease: 'back.out(2)',
  })
  .fromTo(card,
    { opacity: 0, x: -60, rotateY: -8 },
    { opacity: 1, x: 0,   rotateY: 0, duration: .7, ease: 'power3.out' },
    '-=.15'
  );

  /* bullets stagger inside each card */
  const bullets = item.querySelectorAll('.exp-bullets li');
  gsap.fromTo(bullets,
    { opacity: 0, x: -20 },
    {
      opacity: 1, x: 0,
      stagger: .07, duration: .4, ease: 'power2.out',
      scrollTrigger: { trigger: item, start: 'top 75%', once: true, delay: .2 }
    }
  );
});

/* ──────────────────────────────────────────────────────────
   9. EDUCATION — slide in from right
────────────────────────────────────────────────────────── */
gsap.fromTo('.edu-card',
  { opacity: 0, x: 60 },
  {
    opacity: 1, x: 0,
    stagger: .15,
    duration: .7,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.edu-list',
      start: 'top 80%',
      once: true,
    }
  }
);

/* ──────────────────────────────────────────────────────────
   10. SKILL CARDS — scale up with stagger
────────────────────────────────────────────────────────── */
gsap.fromTo('.skill-card',
  { opacity: 0, y: 50, scale: .92 },
  {
    opacity: 1, y: 0, scale: 1,
    stagger: .1,
    duration: .65,
    ease: 'back.out(1.5)',
    scrollTrigger: {
      trigger: '.skills-grid',
      start: 'top 78%',
      once: true,
    }
  }
);

/* ──────────────────────────────────────────────────────────
   11. SKILL CARDS — 3D tilt on hover
────────────────────────────────────────────────────────── */
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect  = card.getBoundingClientRect();
    const cx    = rect.left + rect.width  / 2;
    const cy    = rect.top  + rect.height / 2;
    const dx    = (e.clientX - cx) / (rect.width  / 2);
    const dy    = (e.clientY - cy) / (rect.height / 2);
    gsap.to(card, {
      rotateY: dx * 8,
      rotateX: -dy * 8,
      transformPerspective: 800,
      duration: .3, ease: 'power1.out',
    });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotateY: 0, rotateX: 0, duration: .5, ease: 'power2.out' });
  });
});

/* ──────────────────────────────────────────────────────────
   12. INTERESTS — bounce in
────────────────────────────────────────────────────────── */
gsap.fromTo('.interest-tag',
  { opacity: 0, y: 30, scale: .8 },
  {
    opacity: 1, y: 0, scale: 1,
    stagger: .1,
    duration: .55,
    ease: 'back.out(2)',
    scrollTrigger: {
      trigger: '.interests',
      start: 'top 85%',
      once: true,
    }
  }
);

/* ──────────────────────────────────────────────────────────
   13. CONTACT CARD — scale reveal
────────────────────────────────────────────────────────── */
gsap.fromTo('.contact-card',
  { opacity: 0, scale: .9, y: 40 },
  {
    opacity: 1, scale: 1, y: 0,
    duration: .9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.contact-card',
      start: 'top 82%',
      once: true,
    }
  }
);
gsap.fromTo('.contact-inner > *',
  { opacity: 0, y: 24 },
  {
    opacity: 1, y: 0,
    stagger: .12,
    duration: .6,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.contact-card',
      start: 'top 78%',
      once: true,
    }
  }
);

/* ──────────────────────────────────────────────────────────
   14. FLOATING PARTICLES in hero
────────────────────────────────────────────────────────── */
const hero = document.getElementById('hero');
for (let i = 0; i < 18; i++) {
  const p = document.createElement('div');
  const s = Math.random() * 3.5 + 1.5;
  Object.assign(p.style, {
    position:        'absolute',
    width:           s + 'px',
    height:          s + 'px',
    borderRadius:    '50%',
    background:      'rgba(255,255,255,' + (Math.random() * .4 + .1) + ')',
    left:            Math.random() * 100 + '%',
    top:             Math.random() * 100 + '%',
    zIndex:          '1',
    pointerEvents:   'none',
  });
  hero.querySelector('.hero-bg').appendChild(p);

  gsap.to(p, {
    y: '-=' + (80 + Math.random() * 120),
    x: (Math.random() - .5) * 60,
    opacity: 0,
    duration: 6 + Math.random() * 8,
    repeat: -1,
    delay:  Math.random() * 6,
    ease:   'none',
    onRepeat() {
      gsap.set(p, {
        x: 0, y: 0, opacity: Math.random() * .4 + .1,
        left: Math.random() * 100 + '%',
      });
    }
  });
}

/* ──────────────────────────────────────────────────────────
   15. SMOOTH CURSOR GLOW
────────────────────────────────────────────────────────── */
const cursor = document.createElement('div');
Object.assign(cursor.style, {
  position:      'fixed',
  width:         '340px',
  height:        '340px',
  borderRadius:  '50%',
  background:    'radial-gradient(circle, rgba(37,99,168,.06) 0%, transparent 70%)',
  pointerEvents: 'none',
  zIndex:        '0',
  transform:     'translate(-50%, -50%)',
  transition:    'left .12s, top .12s',
});
document.body.appendChild(cursor);
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

/* ──────────────────────────────────────────────────────────
   16. HORIZONTAL SCROLL HINT — fade out after first scroll
────────────────────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const si = document.querySelector('.scroll-indicator');
  if (si && window.scrollY > 80) {
    gsap.to(si, { opacity: 0, duration: .4 });
  }
}, { passive: true });

/* ──────────────────────────────────────────────────────────
   17. REFRESH ScrollTrigger on load
────────────────────────────────────────────────────────── */
window.addEventListener('load', () => ScrollTrigger.refresh());
