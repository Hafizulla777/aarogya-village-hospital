/* ============================================================================
 * AAROGYA VILLAGE HOSPITAL — app.js
 * Mobile nav, filters, search, form validation, FAQ, counters, reveal
 * ============================================================================ */
(function () {
  'use strict';

  // ------------------------------------------------------------------
  // Header shadow on scroll
  // ------------------------------------------------------------------
  const header = document.querySelector('.header');
  if (header) {
    const onScroll = () => header.classList.toggle('header--scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ------------------------------------------------------------------
  // Mobile navigation
  // ------------------------------------------------------------------
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.getElementById('mobileNav');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileClose = document.getElementById('mobileNavClose');

  function openMenu() {
    if (!mobileNav) return;
    mobileNav.classList.add('mobile-nav--open');
    if (mobileOverlay) mobileOverlay.classList.add('mobile-overlay--open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!mobileNav) return;
    mobileNav.classList.remove('mobile-nav--open');
    if (mobileOverlay) mobileOverlay.classList.remove('mobile-overlay--open');
    document.body.style.overflow = '';
  }

  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  }

  // ------------------------------------------------------------------
  // Service filters (services.html)
  // ------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const serviceCards = document.querySelectorAll('.service-card[data-category]');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');
      const filter = btn.dataset.filter;

      serviceCards.forEach((card) => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.display = show ? 'flex' : 'none';
        if (show) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(14px)';
          requestAnimationFrame(() => {
            card.style.transition = 'all 0.35s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        }
      });
    });
  });

  // ------------------------------------------------------------------
  // Doctor search (doctors.html)
  // ------------------------------------------------------------------
  const doctorSearch = document.getElementById('doctorSearch');
  const doctorCards = document.querySelectorAll('.doctor-card[data-name]');

  if (doctorSearch && doctorCards.length) {
    doctorSearch.addEventListener('input', () => {
      const q = doctorSearch.value.trim().toLowerCase();
      doctorCards.forEach((card) => {
        const name = (card.dataset.name || '').toLowerCase();
        const spec = (card.dataset.spec || '').toLowerCase();
        const match = !q || name.includes(q) || spec.includes(q);
        card.style.display = match ? '' : 'none';
      });
      const empty = document.getElementById('doctorEmpty');
      if (empty) {
        const visible = [...doctorCards].some((c) => c.style.display !== 'none');
        empty.style.display = visible ? 'none' : 'block';
      }
    });
  }

  // ------------------------------------------------------------------
  // FAQ accordion
  // ------------------------------------------------------------------
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const open = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach((i) => i.classList.remove('is-open'));
      if (!open) item.classList.add('is-open');
      btn.setAttribute('aria-expanded', String(!open));
    });
  });

  // ------------------------------------------------------------------
  // Appointment form validation (contact.html)
  // ------------------------------------------------------------------
  const form = document.getElementById('appointmentForm');

  function setError(group, message) {
    group.classList.add('is-error');
    const msg = group.querySelector('.error-msg');
    if (msg && message) msg.textContent = message;
  }

  function clearError(group) {
    group.classList.remove('is-error');
  }

  if (form) {
    const alertBox = document.getElementById('formAlert');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      let firstInvalid = null;

      const fields = [
        { id: 'patientName', validate: (v) => v.length >= 2, msg: 'Please enter the patient name (min 2 characters).' },
        { id: 'phone', validate: (v) => /^[6-9]\d{9}$/.test(v.replace(/\D/g, '')), msg: 'Please enter a valid 10-digit mobile number.' },
        { id: 'service', validate: (v) => v !== '', msg: 'Please select a service.' },
        { id: 'visitDate', validate: (v) => v !== '', msg: 'Please choose a preferred visit date.' },
        { id: 'message', validate: (v) => v.length === 0 || v.length >= 5, msg: 'Please add a short note (min 5 characters) or leave it empty.' }
      ];

      fields.forEach((f) => {
        const el = document.getElementById(f.id);
        if (!el) return;
        const group = el.closest('.form-group');
        if (f.validate(el.value.trim())) {
          clearError(group);
        } else {
          setError(group, f.msg);
          valid = false;
          if (!firstInvalid) firstInvalid = el;
        }
      });

      if (!valid) {
        if (firstInvalid) firstInvalid.focus();
        if (alertBox) alertBox.classList.remove('is-visible');
        return;
      }

      // DEMO ONLY — no backend, no real booking confirmation
      if (alertBox) {
        alertBox.classList.add('is-visible');
        alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      form.reset();
    });

    // Live re-validation on input
    form.querySelectorAll('input, select, textarea').forEach((el) => {
      el.addEventListener('input', () => {
        const group = el.closest('.form-group');
        if (group && group.classList.contains('is-error')) clearError(group);
      });
    });
  }

  // ------------------------------------------------------------------
  // Counters (stats)
  // ------------------------------------------------------------------
  function animateCounter(el) {
    const raw = (el.getAttribute('data-target') || '0').trim();
    const match = raw.match(/^([\d.,]+)(.*)$/);
    if (!match) { el.textContent = raw; return; }

    const target = parseFloat(match[1].replace(/,/g, '')) || 0;
    const suffix = match[2] || '';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const format = (v) => v.toLocaleString('en-IN') + suffix;

    if (reduce) { el.textContent = format(target); return; }

    const duration = 1600;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = format(target);
    }
    requestAnimationFrame(step);
  }

  // ------------------------------------------------------------------
  // Reveal on scroll + trigger counters
  // ------------------------------------------------------------------
  const revealEls = document.querySelectorAll('.reveal, .stat-card');

  function showEl(el) {
    if (el.classList.contains('is-visible')) return;
    el.classList.add('is-visible');
    if (el.classList.contains('stat-card')) {
      const num = el.querySelector('.stat-card__number');
      if (num && !num.dataset.animated) {
        num.dataset.animated = 'true';
        animateCounter(num);
      }
    }
  }

  function pastOrInView(el) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || 0;
    // Reveal if visible or already scrolled past, so fast scrolling can
    // never strand content at opacity 0.
    return r.top < vh - 40;
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        showEl(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => io.observe(el));
  }

  // Fallback: works even if IntersectionObserver never fires (privacy
  // extensions, odd browsers). Uses getBoundingClientRect + scroll, so the
  // reveal animation still plays progressively instead of all at once.
  let revealTick = false;
  function revealFallback() {
    revealTick = false;
    revealEls.forEach((el) => {
      if (!el.classList.contains('is-visible') && pastOrInView(el)) showEl(el);
    });
  }
  function queueReveal() {
    if (revealTick) return;
    revealTick = true;
    setTimeout(revealFallback, 120);
  }
  window.addEventListener('scroll', queueReveal, { passive: true });
  window.addEventListener('resize', queueReveal, { passive: true });
  setTimeout(revealFallback, 400);
  setTimeout(revealFallback, 1600);

  // ------------------------------------------------------------------
  // Visit date minimum = today
  // ------------------------------------------------------------------
  const visitDate = document.getElementById('visitDate');
  if (visitDate) {
    const today = new Date().toISOString().split('T')[0];
    visitDate.setAttribute('min', today);
  }

  // ------------------------------------------------------------------
  // Current year in footer
  // ------------------------------------------------------------------
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
