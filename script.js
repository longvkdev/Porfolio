// ===== PARTICLE SYSTEM =====
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.resize();
    this.init();

    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    const count = Math.min(80, Math.floor(window.innerWidth * window.innerHeight / 15000));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        color: ['108,92,231', '0,206,201', '253,121,168'][Math.floor(Math.random() * 3)]
      });
    }
  }

  update() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
      this.ctx.fill();

      // Draw connections
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(108, 92, 231, ${0.06 * (1 - dist / 120)})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }

      // Mouse interaction
      const mDx = p.x - this.mouse.x;
      const mDy = p.y - this.mouse.y;
      const mDist = Math.sqrt(mDx * mDx + mDy * mDy);
      if (mDist < 150) {
        const force = (150 - mDist) / 150;
        p.vx += (mDx / mDist) * force * 0.02;
        p.vy += (mDy / mDist) * force * 0.02;
      }

      // Damping
      p.vx *= 0.999;
      p.vy *= 0.999;
    });

    requestAnimationFrame(() => this.update());
  }

  start() {
    this.update();
  }
}

// ===== TYPING ANIMATION =====
class TypingEffect {
  constructor(element, phrases, options = {}) {
    this.element = element;
    this.phrases = phrases;
    this.typeSpeed = options.typeSpeed || 60;
    this.deleteSpeed = options.deleteSpeed || 35;
    this.pauseTime = options.pauseTime || 2500;
    this.currentPhrase = 0;
    this.currentChar = 0;
    this.isDeleting = false;
    this.start();
  }

  start() {
    this.type();
  }

  type() {
    const phrase = this.phrases[this.currentPhrase];

    if (this.isDeleting) {
      this.currentChar--;
    } else {
      this.currentChar++;
    }

    const text = phrase.substring(0, this.currentChar);
    this.element.innerHTML = text + '<span class="cursor"></span>';

    let delay = this.isDeleting ? this.deleteSpeed : this.typeSpeed;

    if (!this.isDeleting && this.currentChar === phrase.length) {
      delay = this.pauseTime;
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentChar === 0) {
      this.isDeleting = false;
      this.currentPhrase = (this.currentPhrase + 1) % this.phrases.length;
      delay = 500;
    }

    setTimeout(() => this.type(), delay);
  }
}

// ===== COUNTER ANIMATION =====
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * eased);

    element.textContent = current + (element.dataset.suffix || '');

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Animate counters when hero stats come into view
        if (entry.target.classList.contains('hero-stats')) {
          entry.target.querySelectorAll('.stat-number').forEach(counter => {
            if (!counter.dataset.animated) {
              counter.dataset.animated = true;
              const target = parseInt(counter.dataset.target);
              animateCounter(counter, target);
            }
          });
        }

        // Stagger children animation
        if (entry.target.dataset.stagger) {
          const children = entry.target.children;
          Array.from(children).forEach((child, i) => {
            child.style.transitionDelay = `${i * 100}ms`;
            child.classList.add('visible');
          });
        }
      }
    });
  }, observerOptions);

  // Observe elements
  document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .timeline-item, .hero-stats').forEach(el => {
    observer.observe(el);
  });

  // Skills cards stagger
  document.querySelectorAll('.skills-grid').forEach(grid => {
    grid.dataset.stagger = true;
    observer.observe(grid);
  });
}

// ===== NAVBAR =====
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const links = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');
  const toggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-links');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link tracking
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });

  // Mobile menu
  if (toggle) {
    toggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    // Close on link click
    links.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ===== CONTACT FORM =====
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#name').value;
    const email = form.querySelector('#email').value;
    const message = form.querySelector('#message').value;

    // Open mailto
    const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    window.location.href = `mailto:longvk.dev@gmail.com?subject=${subject}&body=${body}`;

    // Show success feedback
    const btn = form.querySelector('.btn-submit');
    const originalText = btn.innerHTML;
    btn.innerHTML = '✓ Opening email client...';
    btn.style.background = 'linear-gradient(135deg, #00cec9, #00b894)';

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
      form.reset();
    }, 3000);
  });
}

// ===== TILT EFFECT ON PROJECT CARDS =====
function initTiltEffect() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
}

// ===== INLINE VIDEO PLAYERS =====
function initVideoPlayers() {
  document.querySelectorAll('.video-thumb').forEach(thumb => {
    thumb.addEventListener('click', function() {
      const videoId = this.getAttribute('data-youtube-id');
      if (!videoId) return;
      
      const iframe = document.createElement('iframe');
      iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.zIndex = '10';
      
      this.innerHTML = '';
      this.appendChild(iframe);
      this.style.cursor = 'default';
    });
  });
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
  // Particle system
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const particles = new ParticleSystem(canvas);
    particles.start();
  }

  // Typing effect
  const typingEl = document.getElementById('typing-text');
  if (typingEl) {
    new TypingEffect(typingEl, [
      '> Slashed draw calls by 60%',
      '> 90+ FPS on Meta Quest VRC1',
      '> Photon Fusion 2 multiplayer',
      '> AI-accelerated workflows',
      '> 8+ years building games'
    ]);
  }

  // Init modules
  initNavbar();
  initSmoothScroll();
  initScrollAnimations();
  initContactForm();
  initTiltEffect();
  initVideoPlayers();
});
