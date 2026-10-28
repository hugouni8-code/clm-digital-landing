/* ==========================================================================
   CLM-Digital V · animaciones.js
   Capa de 3D y animaciones al hacer scroll. Va con animaciones.css.
   No depende de ninguna librería. Si este archivo no carga, la web se ve
   exactamente igual que antes (nada queda oculto).
   ========================================================================== */
(function () {
  'use strict';

  var RM   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var HAS_IO = 'IntersectionObserver' in window;
  var root = document.documentElement;

  if (!RM && HAS_IO) root.classList.add('ax-motion');
  if (!RM && FINE)   root.classList.add('ax-hover');

  var hero = document.querySelector('.hero-wrapper');
  var heroBlock = document.querySelector('.hero-text-block');


  /* ------------------------------------------------------------------
     2. APARICIÓN EN 3D AL HACER SCROLL
     Solo se ocultan los elementos que todavía no se ven al cargar,
     así nunca hay un parpadeo arriba del todo.
     ------------------------------------------------------------------ */
  var REVEAL = [
    ['.section-header > *', 'ax-soft'],
    ['.about-logo', 'ax-coin'],
    ['.about-text', ''],
    ['.nspeaker-card', ''],
    ['.rt-moderator', ''],
    ['.rt-subhead', 'ax-soft'],
    ['.rt-company', ''],
    ['.venue-map', ''],
    ['.sponsor-card', ''],
    ['.cards-grid > .card', ''],
    ['.speaker-item', ''],
    ['.eboratic-content', ''],
    ['.org-team-title', 'ax-soft'],
    ['.org-card', '']
  ];

  if (root.classList.contains('ax-motion')) {
    var vh = window.innerHeight;
    var pending = [];
    REVEAL.forEach(function (pair) {
      document.querySelectorAll(pair[0]).forEach(function (el) {
        if (el.getBoundingClientRect().top < vh * 0.92) return;   // ya visible: se queda quieto
        el.classList.add('ax-pre');
        if (pair[1]) el.classList.add(pair[1]);
        if (el.parentElement) el.parentElement.classList.add('ax-3d');
        pending.push(el);
      });
    });

    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (en) { return en.isIntersecting; })
        .map(function (en) { return en.target; })
        .sort(function (a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; });
      batch.forEach(function (el, k) { show(el, Math.min(k, 6) * 95); io.unobserve(el); });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    pending.forEach(function (el) { io.observe(el); });
  }

  function show(el, delay) {
    el.style.setProperty('--ax-d', delay + 'ms');
    el.classList.add('ax-run');
    void el.offsetWidth;                // asegura que la transición arranca
    el.classList.remove('ax-pre');
    var done = function () {
      el.classList.remove('ax-run', 'ax-soft', 'ax-coin');
      el.style.removeProperty('--ax-d');
    };
    setTimeout(done, 1100 + delay);
  }


  /* ------------------------------------------------------------------
     3. BAMBÚ QUE CRECE
     ------------------------------------------------------------------ */
  if (root.classList.contains('ax-motion')) {
    var dio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.remove('ax-wait'); dio.unobserve(en.target); }
      });
    }, { threshold: 0.35 });
    document.querySelectorAll('.bamboo-divider').forEach(function (d) {
      if (d.getBoundingClientRect().top < window.innerHeight * 0.9) return;
      d.classList.add('ax-wait');
      dio.observe(d);
    });
  }


  /* ------------------------------------------------------------------
     4. INCLINACIÓN 3D CON EL RATÓN (solo ordenador)
     ------------------------------------------------------------------ */
  if (root.classList.contains('ax-hover')) {
    var TILT = '.nspeaker-card, .sponsor-card, .cards-grid > .card, .speaker-item, .rt-company, .rt-moderator, .org-card';
    document.querySelectorAll(TILT).forEach(function (el) {
      var glare = document.createElement('span');
      glare.className = 'ax-glare';
      glare.setAttribute('aria-hidden', 'true');
      el.appendChild(glare);
      el.classList.add('ax-tilt');
      if (el.parentElement) el.parentElement.classList.add('ax-3d');

      el.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        var ang = Math.hypot(x, y) * 11;
        el.style.rotate = ang < 0.05 ? 'none' : (-y).toFixed(3) + ' ' + x.toFixed(3) + ' 0 ' + ang.toFixed(2) + 'deg';
        el.style.setProperty('--gx', ((x + 0.5) * 100).toFixed(1) + '%');
        el.style.setProperty('--gy', ((y + 0.5) * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', function () { el.style.rotate = ''; });
    });
  }


  /* ------------------------------------------------------------------
     5. CUENTA ATRÁS: giro 3D de cada número cuando cambia
     ------------------------------------------------------------------ */
  if (root.classList.contains('ax-motion') && 'MutationObserver' in window) {
    ['days', 'hours', 'minutes', 'seconds'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var last = el.textContent;
      new MutationObserver(function () {
        if (el.textContent === last) return;
        last = el.textContent;
        el.classList.remove('ax-flip');
        void el.offsetWidth;
        el.classList.add('ax-flip');
      }).observe(el, { childList: true, characterData: true, subtree: true });
    });
  }


  /* ------------------------------------------------------------------
     6. PROGRAMA: columna dorada + perla que avanza con el scroll
     ------------------------------------------------------------------ */
  var timeline = document.querySelector('.timeline');
  var spine = null, tItems = [];
  if (timeline) {
    spine = document.createElement('span');
    spine.className = 'ax-spine ax-spine-idle';
    spine.setAttribute('aria-hidden', 'true');
    timeline.appendChild(spine);
    tItems = Array.prototype.slice.call(timeline.querySelectorAll('.timeline-item'));
  }

  function updateSpine() {
    if (!spine || !tItems.length) return;
    var tl = timeline.getBoundingClientRect();
    var dots = tItems.map(function (it) {
      var d = it.querySelector('.timeline-dot').getBoundingClientRect();
      return d.top + d.height / 2 - tl.top;
    });
    var start = dots[0], end = dots[dots.length - 1];
    var target = window.innerHeight * 0.62 - tl.top;      // la perla va a 62 % de la pantalla
    var h = Math.max(0, Math.min(end - start, target - start));
    timeline.style.setProperty('--ax-spine-top', start + 'px');
    timeline.style.setProperty('--ax-spine-h', h + 'px');
    spine.classList.toggle('ax-spine-idle', h <= 0);
    dots.forEach(function (y, i) { tItems[i].classList.toggle('ax-lit', start + h >= y - 2); });
  }


  /* ------------------------------------------------------------------
     7. MENÚ: marca la sección en la que estás
     ------------------------------------------------------------------ */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var spy = navLinks.map(function (a) {
    var id = (a.getAttribute('href') || '').slice(1);
    return { a: a, el: id ? document.getElementById(id) : null };
  });

  function updateSpy() {
    var line = window.innerHeight * 0.35, current = spy[0];
    spy.forEach(function (s) { if (s.el && s.el.getBoundingClientRect().top <= line) current = s; });
    spy.forEach(function (s) { s.a.classList.toggle('active', s === current); });
  }


  /* ------------------------------------------------------------------
     8. BARRA DE PROGRESO + PARALLAX DEL HERO
     ------------------------------------------------------------------ */
  var bar = null;
  if (!RM) {
    bar = document.createElement('div');
    bar.className = 'ax-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
  }

  var hmx = 0, hmy = 0, thx = 0, thy = 0;
  if (root.classList.contains('ax-hover') && heroBlock) {
    window.addEventListener('pointermove', function (e) {
      thx = (e.clientX / window.innerWidth - 0.5) * 2;
      thy = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  function heroProgress() {
    if (!hero) return 0;
    var h = hero.offsetHeight || 1;
    return Math.max(0, Math.min(1, (window.scrollY - hero.offsetTop) / h));
  }

  function updateHero(p) {
    if (!heroBlock || !root.classList.contains('ax-motion')) return;
    hmx += (thx - hmx) * 0.08; hmy += (thy - hmy) * 0.08;
    var rx = -hmy * 4 + p * 14;          // grados alrededor de X
    var ry = hmx * 5;                    // grados alrededor de Y
    var ang = Math.hypot(rx, ry);
    heroBlock.style.translate = '0 ' + (p * 110).toFixed(1) + 'px';
    heroBlock.style.rotate = ang < 0.05 ? 'none' : (rx / ang).toFixed(3) + ' ' + (ry / ang).toFixed(3) + ' 0 ' + ang.toFixed(2) + 'deg';
    heroBlock.style.opacity = Math.max(0, 1 - p * 1.35).toFixed(3);
  }


  /* ------------------------------------------------------------------
     BUCLE PRINCIPAL
     El parallax del hero solo se calcula mientras está a la vista.
     ------------------------------------------------------------------ */
  var heroVisible = true;
  if (hero && HAS_IO) {
    new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; }).observe(hero);
  }

  function frame(now) {
    var p = heroProgress();
    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--ax-p', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    }
    if (heroVisible) {
      updateHero(p);
    }
    updateSpine();
    updateSpy();
    requestAnimationFrame(frame);
  }

  if (RM) {
    // Movimiento reducido: sin animaciones, solo el menú y el programa
    updateSpine(); updateSpy();
    window.addEventListener('scroll', function () { updateSpine(); updateSpy(); }, { passive: true });
  } else {
    requestAnimationFrame(frame);
  }
})();
