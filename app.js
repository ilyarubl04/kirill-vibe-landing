/* ============================================================
   Вайбкодинг для Кирилла — interactions
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- scroll reveal ---- */
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- nav scrolled state ---- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- subtle parallax on hero terminal ---- */
  var termWrap = document.getElementById('heroTermWrap');
  if (termWrap && !reduce) {
    var raf = null;
    window.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < 900) termWrap.style.transform = 'translateY(' + (y * -0.045) + 'px)';
        raf = null;
      });
    }, { passive: true });

    // pointer tilt
    var hero = termWrap.closest('section');
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      termWrap.querySelector('.window').style.transform =
        'perspective(1200px) rotateY(' + (px * 4) + 'deg) rotateX(' + (-py * 4) + 'deg)';
    });
    hero.addEventListener('pointerleave', function () {
      termWrap.querySelector('.window').style.transform = '';
    });
  }

  /* ============================================================
     Live Claude Code terminal — typing simulation
     ============================================================ */
  var body = document.getElementById('termBody');
  if (!body) return;

  // each step: [className, text, postDelayMs, typeSpeed(0 = instant line)]
  var SCRIPT = [
    ['t-dim',    '╭─ claude code ─────────────────────────────╮', 30, 0],
    ['t-dim',    '│  собираем команду под Кирилла              │', 30, 0],
    ['t-dim',    '╰───────────────────────────────────────────╯', 250, 0],
    ['spacer',   '', 200, 0],
    ['t-accent', '› ', 0, 0, 'inline'],
    ['type',     'собери разбор звонка Влада и отдай бриф продажнику', 500, 24],
    ['spacer',   '', 250, 0],
    ['t-purple', '✻ Запускаю субагентов…', 400, 0],
    ['t-green',  '  ✓ transcribe   запись созвона → текст', 220, 0],
    ['t-green',  '  ✓ analyze      сильные / слабые места', 220, 0],
    ['t-green',  '  ✓ brief        бриф для Влада готов', 350, 0],
    ['spacer',   '', 180, 0],
    ['t-blue',   '  /sales-call-analyzer', 60, 0, 'inline'],
    ['t-dim',    '  собран · 3–5 ч/нед → 1 команда', 400, 0],
    ['spacer',   '', 200, 0],
    ['t-accent', '› ', 0, 0, 'inline'],
    ['type',     'дай 3 готовых сценария рилсов на эту неделю', 500, 24],
    ['spacer',   '', 200, 0],
    ['t-yellow', '✻ /content-generator работает…', 600, 0],
    ['t-user',   '  1. «Почему продажник — не РОП» (хук за 3 сек)', 200, 0],
    ['t-user',   '  2. «AI разобрал мой звонок» (разбор вживую)', 200, 0],
    ['t-user',   '  3. «Что упускают тренеры в 2026» (тренд)', 350, 0],
    ['spacer',   '', 220, 0],
    ['t-green',  '✓ готово. 6 инструментов + бот в твоей неделе.', 600, 0],
    ['cursor',   '', 0, 0]
  ];

  var i = 0;
  function appendLine(cls, text, inline) {
    var el = document.createElement('span');
    el.className = 'l ' + cls;
    el.textContent = text;
    if (inline === 'inline') { el.style.display = 'inline'; }
    body.appendChild(el);
    return el;
  }

  function run() {
    if (i >= SCRIPT.length) return;
    var step = SCRIPT[i];
    var cls = step[0], text = step[1], delay = step[2], speed = step[3], inline = step[4];

    if (cls === 'spacer') {
      var sp = document.createElement('span');
      sp.className = 'l';
      sp.innerHTML = '&nbsp;';
      body.appendChild(sp);
      i++; setTimeout(run, delay); return;
    }

    if (cls === 'cursor') {
      var c = document.createElement('span');
      c.className = 'cursor';
      // attach to a fresh prompt line
      var pl = appendLine('t-accent', '› ', 'inline');
      pl.appendChild(c);
      i++; return;
    }

    if (cls === 'type') {
      // type into the previous inline prompt line (the '›')
      var target = body.lastChild;
      var typed = appendLine('t-user', '', 'inline');
      var n = 0;
      (function typeChar() {
        if (n <= text.length) {
          typed.textContent = text.slice(0, n);
          n++;
          setTimeout(typeChar, reduce ? 0 : speed);
        } else {
          i++; setTimeout(run, delay);
        }
      })();
      return;
    }

    appendLine(cls, text, inline);
    i++;
    setTimeout(run, reduce ? Math.min(delay, 40) : delay);
  }

  // start when hero terminal scrolls into view (or immediately)
  function startTerm() {
    body.innerHTML = '';
    i = 0;
    run();
  }
  window.__restartTerm = startTerm;

  if ('IntersectionObserver' in window) {
    var tobs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { startTerm(); tobs.disconnect(); }
      });
    }, { threshold: 0.3 });
    tobs.observe(body);
  } else {
    startTerm();
  }
})();
