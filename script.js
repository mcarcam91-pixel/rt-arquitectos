/* =============================================
   RT ARQUITECTOS — script.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

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
