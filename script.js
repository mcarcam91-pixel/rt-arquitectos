/* =============================================
   RT ARQUITECTOS — script.js
   ============================================= */

/* ── HERO SLIDER ─────────────────────────────
   Basado en el diseño animado de referencia.
   Autoplay + click + teclado. Sin hijack de scroll.
   ─────────────────────────────────────────── */

const HERO_SLIDES = [
  {
    name:  'Diseño',
    color: '#2A2420',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&q=80',
  },
  {
    name:  'Espacio',
    color: '#1C2028',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80',
  },
  {
    name:  'Visión',
    color: '#22201E',
    image: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=900&q=80',
  },
];

const AUTOPLAY_DELAY = 4500;

const throttle = (fn, limit) => {
  let waiting = false;
  return function (...args) {
    if (!waiting) { fn.apply(this, args); waiting = true; setTimeout(() => { waiting = false; }, limit); }
  };
};

const debounce = (fn, wait) => {
  let t;
  return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); };
};

class HeroSlider {
  constructor() {
    this.current     = 0;
    this.animating   = false;
    this.total       = HERO_SLIDES.length;
    this.el          = document.querySelector('#hero.slider');
    if (!this.el) return;
    this.titleEl     = this.el.querySelector('.slider__title');
    this.imagesEl    = this.el.querySelector('.slider__images');
    this.slideEls    = [];
    this.currentLine = null;
    this.autoPlayId  = null;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.preload();
    this.setTitle(HERO_SLIDES[0].name);
    gsap.set(this.el, { backgroundColor: HERO_SLIDES[0].color });
    this.buildCarousel();
    this.buildCursor();
    this.bind();
    this.startAutoPlay();
  }

  preload() {
    HERO_SLIDES.forEach(s => { new Image().src = s.image; });
  }

  mod(n) { return ((n % this.total) + this.total) % this.total; }

  buildCursor() {
    this.cursorEl = document.createElement('div');
    this.cursorEl.className = 'slider__cursor';
    this.cursorEl.textContent = '+';
    this.cursorEl.setAttribute('aria-hidden', 'true');
    this.el.appendChild(this.cursorEl);
    gsap.set(this.cursorEl, { xPercent: -50, yPercent: -50, opacity: 0 });
    this.cursorMoveX = gsap.quickTo(this.cursorEl, 'x', { duration: 0.5, ease: 'power3' });
    this.cursorMoveY = gsap.quickTo(this.cursorEl, 'y', { duration: 0.5, ease: 'power3' });
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayId = setInterval(() => { if (!this.animating) this.go('next'); }, AUTOPLAY_DELAY);
  }

  stopAutoPlay() {
    if (this.autoPlayId) { clearInterval(this.autoPlayId); this.autoPlayId = null; }
  }

  setTitle(text) {
    this.titleEl.innerHTML = '';
    const line = document.createElement('div');
    [...text].forEach(ch => {
      const span = document.createElement('span');
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      line.appendChild(span);
    });
    this.titleEl.appendChild(line);
    this.currentLine = line;
  }

  animateTitle(newText, direction) {
    const h   = this.titleEl.offsetHeight;
    const dir = direction === 'next' ? 1 : -1;
    const oldLine  = this.currentLine;
    const oldChars = [...oldLine.querySelectorAll('span')];

    this.titleEl.style.height = h + 'px';
    oldLine.style.cssText = 'position:absolute;top:0;left:0;width:100%';

    const newLine = document.createElement('div');
    newLine.style.cssText = 'position:absolute;top:0;left:0;width:100%';
    [...newText].forEach(ch => {
      const span = document.createElement('span');
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      newLine.appendChild(span);
    });
    this.titleEl.appendChild(newLine);

    const newChars = [...newLine.querySelectorAll('span')];
    gsap.set(newChars, { y: h * dir });

    const duration = this.reducedMotion ? 0.01 : 1;
    const stagger  = this.reducedMotion ? 0 : 0.04;

    const tl = gsap.timeline({
      onComplete: () => {
        oldLine.remove();
        newLine.style.cssText = '';
        gsap.set(newChars, { clearProps: 'all' });
        this.titleEl.style.height = '';
        this.currentLine = newLine;
      },
    });

    tl.to(oldChars, { y: -h * dir, stagger, duration, ease: 'expo.inOut' }, 0);
    tl.to(newChars, { y: 0,        stagger, duration, ease: 'expo.inOut' }, 0);
    return tl;
  }

  makeSlide(idx) {
    const div = document.createElement('div');
    div.className = 'slider__slide';
    const img = document.createElement('img');
    img.src    = HERO_SLIDES[idx].image;
    img.alt    = HERO_SLIDES[idx].name;
    img.width  = 900;
    img.height = 640;
    div.appendChild(img);
    return div;
  }

  getSlideProps(step) {
    const h = this.imagesEl.offsetHeight;
    const positions = [
      { x: -0.35, y: -0.95, rot: -30, s: 1.35, b: 16, o: 0   },
      { x: -0.18, y: -0.50, rot: -15, s: 1.15, b:  8, o: 0.55 },
      { x:  0,    y:  0,    rot:   0, s: 1,    b:  0, o: 1    },
      { x: -0.06, y:  0.50, rot:  15, s: 0.75, b:  6, o: 0.55 },
      { x: -0.12, y:  0.95, rot:  30, s: 0.55, b: 14, o: 0   },
    ];
    const idx = Math.max(0, Math.min(4, step + 2));
    const p   = positions[idx];
    return {
      x: p.x * h, y: p.y * h,
      rotation: p.rot, scale: p.s,
      blur: p.b, opacity: p.o,
      zIndex: Math.abs(step) === 0 ? 3 : Math.abs(step) === 1 ? 2 : 1,
    };
  }

  positionSlide(slide, step) {
    const p = this.getSlideProps(step);
    gsap.set(slide, {
      xPercent: -50, yPercent: -50,
      x: p.x, y: p.y,
      rotation: p.rotation, scale: p.scale,
      opacity: p.opacity,
      filter: 'blur(' + p.blur + 'px)',
      zIndex: p.zIndex,
    });
  }

  buildCarousel() {
    if (!this.imagesEl || this.imagesEl.offsetHeight === 0) return;
    this.imagesEl.innerHTML = '';
    this.slideEls = [];
    for (let step = -1; step <= 1; step++) {
      const slide = this.makeSlide(this.mod(this.current + step));
      this.imagesEl.appendChild(slide);
      this.positionSlide(slide, step);
      this.slideEls.push({ el: slide, step });
    }
  }

  animateCarousel(direction) {
    if (!this.imagesEl || this.imagesEl.offsetHeight === 0) return gsap.timeline();
    const shift    = direction === 'next' ? -1 : 1;
    const enterStep = direction === 'next' ? 2 : -2;
    const newIdx   = direction === 'next' ? this.mod(this.current + 2) : this.mod(this.current - 2);

    const newSlide = this.makeSlide(newIdx);
    this.imagesEl.appendChild(newSlide);
    this.positionSlide(newSlide, enterStep);
    this.slideEls.push({ el: newSlide, step: enterStep });

    this.slideEls.forEach(s => { s.step += shift; });

    const duration = this.reducedMotion ? 0.01 : 1.2;
    const tl = gsap.timeline({
      onComplete: () => {
        this.slideEls = this.slideEls.filter(s => {
          if (Math.abs(s.step) >= 2) { s.el.remove(); return false; }
          return true;
        });
      },
    });

    this.slideEls.forEach(s => {
      const p = this.getSlideProps(s.step);
      s.el.style.zIndex = p.zIndex;
      tl.to(s.el, {
        x: p.x, y: p.y,
        rotation: p.rotation, scale: p.scale,
        opacity: p.opacity,
        filter: 'blur(' + p.blur + 'px)',
        duration, ease: 'power3.inOut',
      }, 0);
    });

    return tl;
  }

  go(direction) {
    if (this.animating) return;
    this.animating = true;
    this.startAutoPlay();

    const nextIdx = direction === 'next' ? this.mod(this.current + 1) : this.mod(this.current - 1);

    const master = gsap.timeline({
      onComplete: () => { this.current = nextIdx; this.animating = false; },
    });

    master.to(this.el, {
      backgroundColor: HERO_SLIDES[nextIdx].color,
      duration: this.reducedMotion ? 0.01 : 1.2,
      ease: 'power2.inOut',
    }, 0);

    master.add(this.animateTitle(HERO_SLIDES[nextIdx].name, direction), 0);
    master.add(this.animateCarousel(direction), 0);
  }

  bind() {
    /* Click en hero = siguiente slide */
    this.el.addEventListener('click', (e) => {
      if (e.target.closest('a')) return; // no interceptar links
      this.go('next');
    });

    /* Teclado */
    document.addEventListener('keydown', (e) => {
      if (this.animating) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') this.go('next');
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   this.go('prev');
    });

    /* Cursor personalizado */
    this.el.addEventListener('mousemove', (e) => {
      if (!this.cursorVisible) {
        gsap.to(this.cursorEl, { opacity: 1, duration: 0.3 });
        this.cursorVisible = true;
      }
      this.cursorMoveX(e.clientX);
      this.cursorMoveY(e.clientY);
    }, { passive: true });

    this.el.addEventListener('mouseleave', () => {
      gsap.to(this.cursorEl, { opacity: 0, duration: 0.3 });
      this.cursorVisible = false;
    });

    /* Re-posicionar slides en resize */
    window.addEventListener('resize', debounce(() => {
      if (!this.animating && this.imagesEl.offsetHeight > 0) {
        this.slideEls.forEach(s => this.positionSlide(s.el, s.step));
      }
    }, 300), { passive: true });

    /* Pausar autoplay cuando la pestaña no está visible */
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.animating = false;
        this.stopAutoPlay();
      } else {
        this.startAutoPlay();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {

  /* ── HERO SLIDER INIT ───────────────────── */
  if (typeof gsap !== 'undefined') new HeroSlider();

  /* ── NAV SCROLL EFFECT ───────────────────── */
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── SCROLL REVEAL ───────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 75);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── HAMBURGER MENU ──────────────────────── */
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');

  function toggleMenu(open) {
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    mobileMenu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    toggleMenu(!isOpen);
  });

  // Cerrar al hacer clic en un link
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Cerrar con tecla Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') toggleMenu(false);
  });

  /* ── SMOOTH ANCHOR SCROLL ────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = navbar.offsetHeight + 12;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });

  /* ── CONTACT FORM ────────────────────────── */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('.btn-form');

      // Loading state
      btn.textContent = 'Enviando...';
      btn.disabled = true;

      const data = {
        nombre:   form.querySelector('#name').value.trim(),
        email:    form.querySelector('#email').value.trim(),
        telefono: form.querySelector('#phone').value.trim(),
        tipo:     form.querySelector('#project').value.trim(),
        mensaje:  form.querySelector('#message').value.trim(),
      };

      let msgEl = form.querySelector('.form-feedback');
      if (!msgEl) {
        msgEl = document.createElement('p');
        msgEl.className = 'form-feedback';
        msgEl.style.cssText = 'margin-top:12px;font-size:14px;font-weight:500';
        form.appendChild(msgEl);
      }

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();

        if (res.ok && json.ok) {
          msgEl.textContent = '¡Consulta enviada! Te contactamos pronto.';
          msgEl.style.color = '#4caf50';
          form.reset();
          btn.textContent = 'Enviar consulta';
          btn.disabled = false;
        } else {
          throw new Error(json.error || 'Error desconocido');
        }
      } catch {
        msgEl.textContent = 'Hubo un error. Escribinos por WhatsApp.';
        msgEl.style.color = '#C0392B';
        btn.textContent = 'Enviar consulta';
        btn.disabled = false;
      }
    });
  }

  /* ── FAQ ACORDEÓN ───────────────────────── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // cerrar todos
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      // abrir el clickeado (si estaba cerrado)
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── STATS COUNTER ANIMATION ─────────────── */
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();

      const tick = (now) => {
        const pct = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - pct, 3); // ease-out cubic
        const val  = Math.round(end * ease);
        el.textContent = val + suffix;
        if (pct < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  /* ── THEME TOGGLE ────────────────────────── */
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('rt-theme', next);
    });
  }

});
