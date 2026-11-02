(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tpl = $('#avatar-tpl');
  const POSES = ['wave', 'type', 'think', 'examine', 'celebrate', 'bye'];

  /* 1. One avatar drawing, cloned into every slot (loader, hero, walker) */
  $$('[data-avatar]').forEach(slot => {
    const av = tpl.content.firstElementChild.cloneNode(true);
    av.classList.add(slot.dataset.pose);
    slot.appendChild(av);
  });

  /* 2. Theme: saved choice wins, otherwise follow the system setting */
  const setTheme = t => {
    root.dataset.theme = t;
    $('#theme').setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    try { localStorage.setItem('theme', t); } catch (e) { /* storage unavailable */ }
  };
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) { /* storage unavailable */ }
  setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  $('#theme').addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  /* 3. Loading screen: finishes as soon as the page has loaded, never artificially held */
  const loader = $('#loader');
  const fill = $('#bar-fill');
  const lt = $('#loader-text');
  const msg = "Preparing Kavyasri's little corner of the internet...";
  let ready = document.readyState === 'complete';
  let pct = 0;
  let n = 0;
  window.addEventListener('load', () => { ready = true; });
  setTimeout(() => { ready = true; }, 3500);

  if (reduce) lt.textContent = msg;
  else {
    const typeLoader = setInterval(() => {
      lt.textContent = msg.slice(0, ++n);
      if (n >= msg.length) clearInterval(typeLoader);
    }, 30);
  }
  const barTimer = setInterval(() => {
    pct = Math.min(ready ? 100 : 85, pct + (ready ? 9 : 3));
    fill.style.width = pct + '%';
    if (pct >= 100) {
      clearInterval(barTimer);
      setTimeout(() => {
        loader.classList.add('gone');
        setTimeout(() => { loader.hidden = true; }, 700);
      }, 200);
    }
  }, 60);

  /* 4. Hero typing effect on the headline */
  const typed = $('#typed');
  const full = typed.getAttribute('aria-label');
  if (reduce) typed.textContent = full;
  else {
    let k = 0;
    setTimeout(() => {
      const t = setInterval(() => {
        typed.textContent = full.slice(0, ++k);
        if (k >= full.length) clearInterval(t);
      }, 42);
    }, 1100);
  }

  /* 5. Scroll-triggered reveals */
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  }), { threshold: .15 });
  $$('[data-reveal]').forEach(el => io.observe(el));

  /* 6. Walking figure and active navigation, driven by the section in view */
  const walker = $('#walker');
  const wav = walker.querySelector('.av');
  const links = $$('.menu a');
  const sections = $$('main > section');
  let current = null;
  let walkT;

  const moveTo = (sec, instant) => {
    const max = Math.max(0, innerWidth - walker.offsetWidth - 12);
    if (instant) walker.style.transition = 'none';
    walker.style.transform = `translateX(${max * (+sec.dataset.walk) / 100}px)`;
    if (instant) {
      void walker.offsetWidth;
      walker.style.transition = '';
    }
  };

  const enter = sec => {
    if (sec === current) return;
    current = sec;
    const navId = sec.id === 'bring' ? 'achievements' : sec.id;
    links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + navId));
    wav.classList.add('walk');
    moveTo(sec, false);
    clearTimeout(walkT);
    walkT = setTimeout(() => {
      wav.classList.remove('walk', ...POSES);
      wav.classList.add(sec.dataset.pose);
    }, reduce ? 0 : 1300);
  };

  const secObs = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) enter(e.target);
  }), { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => secObs.observe(s));

  window.addEventListener('resize', () => { if (current) moveTo(current, true); });

  /* 7. Skill filters and hover descriptions */
  const chips = $$('.chip[data-f]');
  chips.forEach(b => b.addEventListener('click', () => {
    chips.forEach(x => {
      const on = x === b;
      x.classList.toggle('is-on', on);
      x.setAttribute('aria-pressed', String(on));
    });
    const f = b.dataset.f;
    $$('.skill').forEach(s => s.classList.toggle('dim', f !== 'all' && s.dataset.cat !== f));
  }));

  const sdesc = $('#skill-desc');
  $$('.skill').forEach(s => ['mouseenter', 'focus', 'click'].forEach(ev =>
    s.addEventListener(ev, () => { sdesc.textContent = s.dataset.desc; })
  ));

  /* 8. Mobile menu */
  const burger = $('#burger');
  const menu = $('#menu');
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  menu.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
    }
  });

  /* 9. Contact form: opens the visitor's email app with the message filled in */
  $('#contact-form').addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const subject = encodeURIComponent('Portfolio enquiry from ' + d.get('name'));
    const body = encodeURIComponent(`${d.get('message')}\n\n- ${d.get('name')} (${d.get('email')})`);
    location.href = `mailto:rkavyasri2808@gmail.com?subject=${subject}&body=${body}`;
  });

  /* 10. Project 03 illustration: 21 hand landmarks, index tip is landmark 8 */
  const pts = [
    [110, 170], [80, 150], [70, 130], [62, 112], [56, 96],
    [100, 120], [104, 95], [108, 75], [112, 58],
    [116, 120], [122, 95], [128, 75], [132, 60],
    [128, 124], [138, 100], [144, 82], [148, 68],
    [138, 140], [152, 122], [158, 106], [162, 92]
  ];
  const lm = $('#landmarks');
  if (lm) lm.innerHTML = pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4"/>`).join('');
})();
