// Long Vu — portfolio interactions (no dependencies)
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== Reveal on scroll (with sibling stagger) =====
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = el.parentElement ? Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal')) : [];
        const index = Math.max(0, siblings.indexOf(el));
        if (!reduceMotion && siblings.length > 1) el.style.transitionDelay = `${Math.min(index, 6) * 70}ms`;
        el.classList.add('is-visible');
        if (el.id === 'hero-stats') animateStats(el);
        observer.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(el => observer.observe(el));
  }

  // ===== Stat counters =====
  function animateStats(root) {
    if (reduceMotion) return;
    root.querySelectorAll('.stat-number').forEach(node => {
      const target = parseInt(node.dataset.target, 10);
      const prefix = node.dataset.prefix || '';
      const suffix = node.dataset.suffix || '';
      const start = performance.now();
      const duration = 1600;
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        node.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  // ===== Navbar: scrolled state, active link, mobile menu =====
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('mobile-toggle');
    const menu = document.getElementById('nav-links');
    const links = Array.from(menu.querySelectorAll('a[href^="#"]'));

    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const setMenu = (open) => {
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
    links.forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

    if (!('IntersectionObserver' in window)) return;
    const byId = new Map(links.map(l => [l.getAttribute('href').slice(1), l]));
    const sections = Array.from(byId.keys()).map(id => document.getElementById(id)).filter(Boolean);
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(l => l.classList.remove('active'));
        const link = byId.get(entry.target.id);
        if (link && !link.classList.contains('nav-cta')) link.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  // ===== Hero spotlight follows the pointer =====
  function initSpotlight() {
    const hero = document.getElementById('hero');
    if (!hero || reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;
    let frame = 0;
    hero.addEventListener('pointermove', (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
        hero.style.setProperty('--my', `${e.clientY - r.top}px`);
        frame = 0;
      });
    });
  }

  // ===== Inline YouTube players =====
  function initVideoPlayers() {
    document.querySelectorAll('.video-thumb[data-youtube-id]').forEach(thumb => {
      const button = thumb.querySelector('.video-cover');
      if (!button) return;
      button.addEventListener('click', () => {
        const id = thumb.dataset.youtubeId;
        const start = thumb.dataset.start || '0';
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&start=${encodeURIComponent(start)}`;
        iframe.title = button.getAttribute('aria-label') || 'Gameplay video';
        iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen', '');
        thumb.replaceChildren(iframe);
        iframe.focus();
      });
    });
  }

  // ===== Screenshot galleries =====
  function initGalleries() {
    document.querySelectorAll('[data-gallery]').forEach(gallery => {
      const main = gallery.querySelector('.gallery-main');
      const thumbs = Array.from(gallery.querySelectorAll('.gallery-thumb'));
      // Warm the cache so swaps are instant.
      thumbs.forEach(t => { const img = new Image(); img.src = t.dataset.src; });
      thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
          if (thumb.classList.contains('is-active')) return;
          thumbs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-pressed', 'false'); });
          thumb.classList.add('is-active');
          thumb.setAttribute('aria-pressed', 'true');
          const swap = () => {
            main.src = thumb.dataset.src;
            main.alt = thumb.dataset.alt || '';
            main.classList.remove('is-swapping');
          };
          if (reduceMotion) { swap(); return; }
          main.classList.add('is-swapping');
          setTimeout(swap, 180);
        });
      });
    });
  }

  // ===== Contact form → mail client =====
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // form.name is the form's own name attribute, so read fields via elements.
      const field = (key) => form.elements.namedItem(key).value.trim();
      const name = field('name');
      const email = field('email');
      const message = field('message');
      const subject = encodeURIComponent(`Portfolio contact from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      window.location.href = `mailto:longvk.dev@gmail.com?subject=${subject}&body=${body}`;

      const btn = form.querySelector('.btn-submit');
      const original = btn.innerHTML;
      btn.textContent = '✓ Opening your email app…';
      btn.classList.add('is-sent');
      setTimeout(() => { btn.innerHTML = original; btn.classList.remove('is-sent'); form.reset(); }, 3000);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initNavbar();
    initSpotlight();
    initVideoPlayers();
    initGalleries();
    initContactForm();
  });
})();
