/* ═══════════════════════════════════════════════════════════
   EVAN GERDAN — Portfolio animations
   GSAP + ScrollTrigger, mcshannock-inspired
═══════════════════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);


/* ─────────────────────────────────────────────────────────
   1. PROGRESS BAR
───────────────────────────────────────────────────────── */
const pb = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  pb.style.width = (pct * 100) + '%';
}, { passive: true });

/* ─────────────────────────────────────────────────────────
   2. CUSTOM CURSOR — état différent par section
───────────────────────────────────────────────────────── */
if (!isTouchDevice) {
  const cursor = document.getElementById('cursor');
  let visible  = false;
  let curState = 'default';

  /* centrage GSAP (xPercent/yPercent évite de casser le transform) */
  gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0 });

  /* position souris courante pour les ripples + trail */
  let mouseX = 0, mouseY = 0;

  /* ── Canvas trail — ligne continue ── */
  const trailCanvas = document.createElement('canvas');
  Object.assign(trailCanvas.style, {
    position: 'fixed', top: '0', left: '0',
    pointerEvents: 'none', zIndex: '9993',
  });
  document.body.appendChild(trailCanvas);
  const trailCtx = trailCanvas.getContext('2d');

  function resizeTrail() {
    trailCanvas.width  = window.innerWidth;
    trailCanvas.height = window.innerHeight;
  }
  resizeTrail();
  window.addEventListener('resize', resizeTrail);

  let trailPts  = [];
  let trailRaf  = null;
  const TRAIL_MS = 520;

  function drawTrail() {
    const now = Date.now();
    trailPts = trailPts.filter(p => now - p.t < TRAIL_MS);
    trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

    for (let i = 1; i < trailPts.length; i++) {
      const p0  = trailPts[i - 1];
      const p1  = trailPts[i];
      const age = (now - p1.t) / TRAIL_MS;
      const a   = Math.pow(1 - age, 1.6) * 0.72;
      const lw  = (1 - age) * 9 + 1.5;

      trailCtx.beginPath();
      trailCtx.moveTo(p0.x, p0.y);
      trailCtx.lineTo(p1.x, p1.y);
      trailCtx.strokeStyle = `rgba(240,188,10,${a})`;
      trailCtx.lineWidth   = lw;
      trailCtx.lineCap     = 'round';
      trailCtx.lineJoin    = 'round';
      trailCtx.stroke();
    }

    trailRaf = trailPts.length > 0
      ? requestAnimationFrame(drawTrail)
      : null;
  }

  /* ── SVG flèche réutilisable ── */
  const arrowSVG = `<svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path d="M4.167 10h11.666M10 4.167L15.833 10 10 15.833"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  /* ── Définition des états ── */
  const STATES = {
    default:     { w:20,  h:20,  bg:'rgba(240,188,10,0.55)', color:'#0a0a0a', r:'50%', border:'none',                           ripple:'rgba(240,188,10,0.5)', html:'' },
    stats:       { w:54,  h:54,  bg:'#0a0a0a',         color:'#ffffff',    r:'50%',  border:'1.5px solid rgba(255,255,255,.22)', ripple:'rgba(255,255,255,0.5)', html:`<span style="font-size:1.5rem;font-weight:900;line-height:1">+</span>` },
    experience:  { w:84,  h:84,  bg:'rgba(0,0,0,0)',   color:'#ffffff',    r:'50%',  border:'1.5px solid rgba(255,255,255,.45)', ripple:'rgba(255,255,255,0.45)',html:`<span style="font-size:.58rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase">EXP</span>` },
    formation:   { w:58,  h:58,  bg:'#ffffff',         color:'#0a0a0a',    r:'13px', border:'none',                            ripple:'rgba(10,10,10,0.35)',   html:`<span style="font-size:2rem;font-weight:900;line-height:1">°</span>` },
    competences: { w:66,  h:66,  bg:'#f0bc0a',         color:'#0a0a0a',    r:'50%',  border:'none',                            ripple:'rgba(240,188,10,0.6)',  html:`<span style="font-size:.9rem;font-weight:900;letter-spacing:-.03em">{/}</span>` },
    interets:    { w:18,  h:18,  bg:'#f0bc0a',         color:'transparent',r:'50%',  border:'none',                            ripple:'rgba(240,188,10,0.7)',  html:'' },
    contact:     { w:66,  h:66,  bg:'#ffffff',         color:'#0a0a0a',    r:'50%',  border:'none',                            ripple:'rgba(255,255,255,0.7)', html:`<span style="font-size:1.4rem;font-weight:700;line-height:1">@</span>` },
  };

  /* couleur de ripple courante */
  let rippleColor = STATES.default.ripple;
  let rippleR     = STATES.default.r;

  function setCursor(state) {
    if (curState === state) return;
    /* quitte le hero → efface la trainée */
    if (curState === 'default') {
      trailPts = [];
      trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    }
    curState = state;
    const s = STATES[state] || STATES.default;
    rippleColor = s.ripple;
    rippleR     = s.r;

    cursor.style.border = s.border;
    cursor.innerHTML    = s.html;

    gsap.to(cursor, {
      width: s.w, height: s.h,
      backgroundColor: s.bg,
      color: s.color,
      borderRadius: s.r,
      duration: .38, ease: 'power2.out',
      overwrite: true,
    });
  }

  /* ── Animation au clic ── */
  document.addEventListener('mousedown', () => {
    if (!visible) return;
    gsap.to(cursor, { scale: .68, duration: .1, ease: 'power3.in', overwrite: 'auto' });
  });

  document.addEventListener('mouseup', () => {
    if (!visible) return;

    /* 1. Cursor bounce-back */
    gsap.to(cursor, { scale: 1, duration: .5, ease: 'elastic.out(1.2, 0.4)', overwrite: 'auto' });

    /* 2. Ripple ring — taille depuis l'état courant (pas offsetWidth qui peut être 0) */
    const s = STATES[curState] || STATES.default;
    const w = s.w;
    const h = s.h;

    const ring = document.createElement('div');
    Object.assign(ring.style, {
      position:      'fixed',
      pointerEvents: 'none',
      zIndex:        '9996',
      width:          w + 'px',
      height:         h + 'px',
      borderRadius:   rippleR,
      border:        `2px solid ${rippleColor}`,
      top:           '0', left: '0',
    });
    document.body.appendChild(ring);

    gsap.set(ring, { x: mouseX, y: mouseY, xPercent: -50, yPercent: -50, scale: 1, opacity: 1 });
    gsap.to(ring, {
      scale:   2.6,
      opacity: 0,
      duration: .6,
      ease:    'power2.out',
      onComplete: () => ring.remove(),
    });

    /* 3. Deuxième ring décalé (plus rapide, plus grand) */
    const ring2 = ring.cloneNode();
    document.body.appendChild(ring2);
    gsap.set(ring2, { x: mouseX, y: mouseY, xPercent: -50, yPercent: -50, scale: 1, opacity: .5 });
    gsap.to(ring2, {
      scale:   4,
      opacity: 0,
      duration: .9,
      ease:    'power1.out',
      delay:   .08,
      onComplete: () => ring2.remove(),
    });
  });

  /* ── Suivi souris + trainée (état default uniquement) ── */
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.to(cursor, { x: mouseX, y: mouseY, duration: .14, ease: 'power2.out' });
    if (!visible) {
      visible = true;
      gsap.to(cursor, { opacity: 1, scale: 1, duration: .4, ease: 'back.out(1.7)' });
    }

    /* trainée canvas — seulement sur le hero (état default) */
    if (curState === 'default' && visible) {
      trailPts.push({ x: mouseX, y: mouseY, t: Date.now() });
      if (!trailRaf) trailRaf = requestAnimationFrame(drawTrail);
    }
  });

  document.addEventListener('mouseleave', () => {
    visible = false;
    gsap.to(cursor, { scale: 0, opacity: 0, duration: .3 });
  });

  /* ── Changement d'état par section au scroll ── */
  [
    { sel: '.stats-section',     state: 'stats'       },
    { sel: '#experience',        state: 'experience'  },
    { sel: '#formation',         state: 'formation'   },
    { sel: '#competences',       state: 'competences' },
    { sel: '.section-interests', state: 'interets'    },
    { sel: '#contact',           state: 'contact'     },
  ].forEach(({ sel, state }) => {
    const el = document.querySelector(sel);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 50%',
      end:   'bottom 50%',
      onEnter:     () => setCursor(state),
      onLeave:     () => setCursor('default'),
      onEnterBack: () => setCursor(state),
      onLeaveBack: () => setCursor('default'),
    });
  });
}

/* ─────────────────────────────────────────────────────────
   3. HEADER — frosted on scroll
───────────────────────────────────────────────────────── */
const header = document.getElementById('header');
ScrollTrigger.create({
  start: 'top -80',
  onEnter:     () => header.classList.add('scrolled'),
  onLeaveBack: () => header.classList.remove('scrolled'),
});

/* ─────────────────────────────────────────────────────────
   4. MOBILE MENU
───────────────────────────────────────────────────────── */
const burger     = document.getElementById('burger');
const mobileMenu = document.getElementById('mobile-menu');

function openMenu()  { mobileMenu.classList.add('open');    burger.classList.add('open'); }
function closeMenu() { mobileMenu.classList.remove('open'); burger.classList.remove('open'); }

/* burger = toggle : ouvre si fermé, ferme si ouvert */
burger.addEventListener('click', () => {
  mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
});

/* ferme aussi en cliquant un lien du menu */
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

/* ─────────────────────────────────────────────────────────
   5. HERO TABS
───────────────────────────────────────────────────────── */
document.querySelectorAll('.hero-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.hero-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});

/* ─────────────────────────────────────────────────────────
   6. HERO ENTRANCE — lettre par lettre
───────────────────────────────────────────────────────── */

/* Split chaque .hn-line en spans de caractères — desktop seulement */
const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: .05 });

if (!isTouchDevice) {
  document.querySelectorAll('.hn-line').forEach(line => {
    const text = line.textContent;
    line.innerHTML = text.split('').map(ch =>
      `<span class="char" style="display:inline-block">${ch === ' ' ? '&nbsp;' : ch}</span>`
    ).join('');
  });
  heroTl
    .from('.hero-headline .char', {
      y: 70, opacity: 0,
      stagger: { each: 0.06, from: 'start' },
      duration: 0.45,
      ease: 'power2.out',
    })
    .from('.hi-desc',     { y: 18, opacity: 0, duration: .55 }, '-=.2')
    .from('.hi-meta',     { y: 12, opacity: 0, duration: .45 }, '-=.3')
    .from('.hi-cta',      { y: 12, opacity: 0, duration: .4 }, '-=.25')
    .from('.scroll-indicator', { opacity: 0, duration: .5 }, '-=.2');
} else {
  /* Mobile : simple fade rapide */
  heroTl
    .from('.hero-headline', { opacity: 0, y: 20, duration: .4, ease: 'power2.out' })
    .from('.hi-desc',       { opacity: 0, y: 12, duration: .35 }, '-=.15')
    .from('.hi-meta',       { opacity: 0, duration: .3 }, '-=.1')
    .from('.hi-cta',        { opacity: 0, duration: .3 }, '-=.1');
}

/* ─────────────────────────────────────────────────────────
   7. HERO PARALLAX on scroll — desktop only
───────────────────────────────────────────────────────── */
if (!isTouchDevice) {
  gsap.to('.hero-headline', {
    y: 60, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.5 }
  });
  gsap.to('.hero-info-center', {
    y: 40, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
  });
  gsap.to('.hero-grid', {
    y: -60, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 2 }
  });
}

/* ─────────────────────────────────────────────────────────
   8. SCROLL INDICATOR — fade on first scroll
───────────────────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  if (window.scrollY > 100) gsap.to('.scroll-indicator', { opacity: 0, duration: .4 });
}, { once: true, passive: true });

/* ─────────────────────────────────────────────────────────
   9. STATS — pop up + counter
───────────────────────────────────────────────────────── */
gsap.to('.stat-item', {
  y: 0, opacity: 1, stagger: .14, duration: .85, ease: 'back.out(1.6)',
  scrollTrigger: { trigger: '.stats-section', start: 'top 82%', once: true }
});

ScrollTrigger.create({
  trigger: '.stats-section', start: 'top 82%', once: true,
  onEnter() {
    document.querySelectorAll('.counter').forEach(el => {
      const target = +el.dataset.target;
      gsap.fromTo(el,
        { innerText: 0 },
        {
          innerText: target,
          duration: target > 100 ? 2.2 : 1.3,
          ease: 'power2.out',
          snap: { innerText: 1 },
          onUpdate() { el.innerText = Math.round(this.targets()[0].innerText); }
        }
      );
    });
  }
});

/* ─────────────────────────────────────────────────────────
   10. SECTION WORD REVEALS
───────────────────────────────────────────────────────── */

/* Wrap each [data-word] in a clip container */
document.querySelectorAll('[data-word]').forEach(word => {
  const wrap = document.createElement('span');
  wrap.className = 'word-clip';
  word.parentNode.insertBefore(wrap, word);
  wrap.appendChild(word);
  /* set initial position on word itself */
  gsap.set(word, { y: '110%', display: 'inline-block' });
});

/* Animate each heading */
document.querySelectorAll('.section-heading, .contact-heading').forEach(heading => {
  gsap.to(heading.querySelectorAll('[data-word]'), {
    y: '0%', stagger: .075, duration: 1, ease: 'power4.out',
    scrollTrigger: { trigger: heading, start: 'top 88%', once: true }
  });
});

/* Section labels */
gsap.utils.toArray('.section-label').forEach(label => {
  gsap.to(label, {
    opacity: 1, y: 0, duration: .65, ease: 'power2.out',
    scrollTrigger: { trigger: label, start: 'top 90%', once: true }
  });
});

/* ─────────────────────────────────────────────────────────
   11. TIMELINE — draw progress line
───────────────────────────────────────────────────────── */
const tlProgress = document.querySelector('.tl-progress');
if (tlProgress) {
  ScrollTrigger.create({
    trigger: '.timeline',
    start: 'top 68%',
    end:   'bottom 68%',
    scrub: .8,
    onUpdate(self) {
      tlProgress.style.height = (self.progress * 100) + '%';
    }
  });
}

/* ─────────────────────────────────────────────────────────
   12. EXPERIENCE CARDS
───────────────────────────────────────────────────────── */
document.querySelectorAll('.tl-item').forEach(item => {
  const dot  = item.querySelector('.tl-dot');
  const card = item.querySelector('.exp-card');

  const tl = gsap.timeline({
    scrollTrigger: { trigger: item, start: 'top 84%', once: true }
  });
  tl
    .to(dot, { opacity: 1, scale: 1, duration: .4, ease: 'back.out(2.5)' })
    .fromTo(card,
      { opacity: 0, x: -44 },
      { opacity: 1, x: 0, duration: .75, ease: 'power3.out' },
      '-=.18'
    );

  /* bullets stagger */
  gsap.fromTo(item.querySelectorAll('.exp-list li'),
    { opacity: 0, x: -18 },
    {
      opacity: 1, x: 0, stagger: .055, duration: .4, ease: 'power2.out',
      scrollTrigger: { trigger: item, start: 'top 80%', once: true },
      delay: .25
    }
  );
});

/* ─────────────────────────────────────────────────────────
   13. EDUCATION CARDS
───────────────────────────────────────────────────────── */
gsap.to('.edu-card', {
  opacity: 1, y: 0, stagger: .13, duration: .7, ease: 'power3.out',
  scrollTrigger: { trigger: '.edu-list', start: 'top 82%', once: true }
});

/* ─────────────────────────────────────────────────────────
   14. SKILL CARDS — staggered reveal + 3D tilt
───────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────
   14b. SKILLS — horizontal scroll GSAP
───────────────────────────────────────────────────────── */
const skillsTrack = document.querySelector('.skills-track');
if (skillsTrack && !isTouchDevice) {
  gsap.to(skillsTrack, {
    x: () => -(skillsTrack.scrollWidth - window.innerWidth + 160),
    ease: 'none',
    scrollTrigger: {
      trigger: '#competences',
      pin: true,
      scrub: 1.2,
      start: 'top top',
      end: () => '+=' + (skillsTrack.scrollWidth - window.innerWidth + 160),
      invalidateOnRefresh: true,
    }
  });
}

/* Mobile: free horizontal scroll natif */
if (isTouchDevice && skillsTrack) {
  skillsTrack.parentElement.style.overflowX = 'auto';
  skillsTrack.parentElement.style.webkitOverflowScrolling = 'touch';
}

if (!isTouchDevice) {
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      gsap.to(card, {
        rotateY: dx * 5, rotateX: -dy * 5,
        transformPerspective: 900,
        duration: .3, ease: 'power1.out',
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: .55, ease: 'power2.out' });
    });
  });
}

/* ─────────────────────────────────────────────────────────
   15. INTERESTS PILLS
───────────────────────────────────────────────────────── */
gsap.fromTo('.interest-pill',
  { opacity: 0, y: 22, scale: .88 },
  {
    opacity: 1, y: 0, scale: 1, stagger: .1, duration: .55, ease: 'back.out(2)',
    scrollTrigger: { trigger: '.interests-pills', start: 'top 88%', once: true }
  }
);

/* ─────────────────────────────────────────────────────────
   16. CONTACT SECTION
───────────────────────────────────────────────────────── */
gsap.fromTo('.contact-sub, .contact-btns',
  { opacity: 0, y: 28 },
  {
    opacity: 1, y: 0, stagger: .1, duration: .7, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact-inner', start: 'top 82%', once: true }
  }
);
gsap.fromTo('.section-label',
  {},
  {}
); /* already handled above */

/* ─────────────────────────────────────────────────────────
   17. MARQUEE — pause on hover
───────────────────────────────────────────────────────── */
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) {
  const strip = document.querySelector('.marquee-strip');
  strip.addEventListener('mouseenter', () => {
    marqueeTrack.style.animationPlayState = 'paused';
  });
  strip.addEventListener('mouseleave', () => {
    marqueeTrack.style.animationPlayState = 'running';
  });
}

/* ─────────────────────────────────────────────────────────
   18. REFRESH on load
───────────────────────────────────────────────────────── */
window.addEventListener('load', () => ScrollTrigger.refresh());


/* ── SON AMBIANT ──────────────────────────────── */
(function() {
  const btn   = document.getElementById('sound-btn');
  const audio = document.getElementById('ambient-audio');
  const label = document.getElementById('sound-label');
  const iconOn  = document.getElementById('icon-sound-on');
  const iconOff = document.getElementById('icon-sound-off');

  if (!btn || !audio) return;

  audio.volume = 0.4;
  let playing = false;

  btn.addEventListener('click', function() {
    if (!playing) {
      audio.play().then(() => {
        playing = true;
        label.textContent = 'Son ambiant activé';
        iconOn.style.display  = 'block';
        iconOff.style.display = 'none';
        btn.classList.add('playing');
      }).catch(() => {});
    } else {
      audio.pause();
      playing = false;
      label.textContent = 'Activez le son ambiant';
      iconOn.style.display  = 'none';
      iconOff.style.display = 'block';
      btn.classList.remove('playing');
    }
  });
})();


/* ── TO TOP ───────────────────────────────────── */
(function() {
  const btn = document.getElementById('to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 100);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
