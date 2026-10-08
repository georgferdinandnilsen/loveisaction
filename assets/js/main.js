/* New Life Mission - Aid: meny, innfading, kopier-knapper og kontaktskjema. Ingen avhengigheter. */
(function () {
  'use strict';

  // Mobilmeny
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('meny');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  }

  // Undermeny for Prosjekter (knappen ved siden av lenken)
  var subItem = document.querySelector('.has-sub');
  var subBtn = subItem && subItem.querySelector('.sub-btn');
  function setSub(open) {
    subItem.classList.toggle('open', open);
    subBtn.setAttribute('aria-expanded', String(open));
  }
  if (subBtn) {
    subBtn.addEventListener('click', function () { setSub(!subItem.classList.contains('open')); });
    document.addEventListener('click', function (e) { if (!subItem.contains(e.target)) setSub(false); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (subBtn) setSub(false);
    if (nav && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
  });

  // Rolig innfading når innhold kommer til syne
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Kopier kontonummer
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var label = btn.textContent;
    btn.addEventListener('click', function () {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(function () {
        btn.textContent = btn.getAttribute('data-copied');
        setTimeout(function () { btn.textContent = label; }, 2000);
      });
    });
  });

  // Kontaktskjema.
  // Uten skjematjeneste åpner skjemaet e-postprogrammet til den besøkende med meldingen ferdig utfylt.
  // Med en skjematjeneste (for eksempel Formspree): lim inn adressen i data-endpoint på <form>,
  // så sendes meldingen direkte fra siden.
  var form = document.querySelector('.js-contact');
  if (form) {
    var status = form.querySelector('.form-status');
    var say = function (key, state) { status.textContent = form.getAttribute('data-msg-' + key); status.setAttribute('data-state', state); };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements.nettside && form.elements.nettside.value) return; // skjult felt som bare roboter fyller ut
      var endpoint = form.getAttribute('data-endpoint');
      var v = function (name) { return (form.elements[name].value || '').trim(); };
      if (endpoint) {
        var button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        say('sending', 'info');
        fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
          .then(function (res) { if (!res.ok) throw new Error('send'); form.reset(); say('sent', 'ok'); })
          .catch(function () { say('error', 'error'); })
          .then(function () { button.disabled = false; });
        return;
      }
      var lines = [v('melding'), '', (v('fornavn') + ' ' + v('etternavn')).trim(), v('epost'), v('telefon')].filter(function (line, i) { return i < 2 || line; });
      window.location.href = 'mailto:' + form.getAttribute('data-mailto') +
        '?subject=' + encodeURIComponent(form.getAttribute('data-subject')) +
        '&body=' + encodeURIComponent(lines.join('\n'));
      say('mail', 'info');
    });
  }
})();
