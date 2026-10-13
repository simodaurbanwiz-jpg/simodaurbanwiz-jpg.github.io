(function () {
  'use strict';
  const S = SITE, root = document.documentElement;
  const $ = (q, c) => (c || document).querySelector(q);
  const $$ = (q, c) => Array.from((c || document).querySelectorAll(q));
  const reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
    del: k => { try { localStorage.removeItem(k); } catch (e) {} }
  };
  const hash = s => { let h = 5381, i = s.length; while (i) h = (h * 33) ^ s.charCodeAt(--i); return (h >>> 0).toString(36); };
  const H = hash(JSON.stringify(S));
  const isObj = x => x && typeof x === 'object' && !Array.isArray(x);
  const merge = (a, b) => Object.keys(b).forEach(k => { if (isObj(a[k]) && isObj(b[k])) merge(a[k], b[k]); else a[k] = b[k]; });
  // Settings saved by the live editor (this browser only). Dropped automatically if config.js changes.
  try { const sv = JSON.parse(store.get('pf_site') || 'null'); if (sv && sv.h === H) merge(S, sv.d); } catch (e) {}
  const pm = store.get('pf_mode'); if (pm) S.theme.mode = pm;
  S.effects = Object.assign({ typewriter: true, reveal: true, tilt: true, spotlight: true, parallax: true, progressBar: true }, S.effects || {});
  S.texts = S.texts || {};
  const save = () => store.set('pf_site', JSON.stringify({ h: H, d: S }));
  const dark = () => root.dataset.theme === 'dark' || (root.dataset.theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);

  /* ---------- fonts & theme ---------- */
  const fonts = () => {
    let l = $('#pf-font');
    if (!l) { l = document.createElement('link'); l.id = 'pf-font'; l.rel = 'stylesheet'; document.head.appendChild(l); }
    const f = n => n.trim().replace(/ /g, '+');
    l.href = 'https://fonts.googleapis.com/css2?family=' + f(S.fonts.heading) + '&family=' + f(S.fonts.body) + '&display=swap';
    root.style.setProperty('--font-head', "'" + S.fonts.heading + "'");
    root.style.setProperty('--font-body', "'" + S.fonts.body + "'");
  };
  const theme = () => {
    const T = S.theme;
    if (T.mode && T.mode !== 'auto') root.setAttribute('data-theme', T.mode); else root.removeAttribute('data-theme');
    ['accent', 'accent2'].forEach(k => T[k] ? root.style.setProperty('--' + k, T[k]) : root.style.removeProperty('--' + k));
    ['bg', 'card', 'text', 'muted', 'line'].forEach(k => (T.colors || {})[k] ? root.style.setProperty('--' + k, T.colors[k]) : root.style.removeProperty('--' + k));
    const b = $('#themeBtn'); if (b) b.textContent = dark() ? '☀️' : '🌙';
  };

  /* ---------- orbit ---------- */
  const orbit = () => {
    const o = S.orbit, orb = $('.orbit'), rings = $('#rings'); rings.innerHTML = '';
    orb.style.setProperty('--s', `min(86vw,${o.size}px)`);
    orb.style.setProperty('--icon', o.iconSize + 'px');
    orb.style.setProperty('--photo', o.photoSize + '%');
    orb.style.setProperty('--r1', o.rings[0].radius);
    const groups = {};
    S.icons.forEach(ic => { const k = ic.ring || 0; (groups[k] = groups[k] || []).push(ic); });
    Object.keys(groups).forEach(k => {
      const cfg = o.rings[k] || o.rings[0], arr = groups[k], rev = cfg.direction < 0;
      const ring = document.createElement('div'); ring.className = 'ring';
      ring.style.setProperty('--rad', cfg.radius);
      ring.style.setProperty('--dur', cfg.seconds + 's');
      ring.style.setProperty('--dir', rev ? 'reverse' : 'normal');
      ring.style.setProperty('--rdir', rev ? 'normal' : 'reverse');
      arr.forEach((ic, i) => {
        const el = document.createElement(ic.url ? 'a' : 'div');
        el.className = 'ico' + (ic.anim && ic.anim !== 'none' ? ' a-' + ic.anim : '');
        el.style.setProperty('--a', (ic.angle != null ? ic.angle : i * 360 / arr.length) + 'deg');
        if (ic.scale) el.style.setProperty('--k', ic.scale);
        el.title = ic.label || '';
        if (ic.url) { el.href = ic.url; el.setAttribute('aria-label', ic.label || ''); if (/^https?:/.test(ic.url)) { el.target = '_blank'; el.rel = 'noopener'; } }
        const sp = document.createElement('span');
        sp.style.background = ic.bg || '#fff'; sp.style.color = ic.color || '#000';
        if (ic.svg) sp.innerHTML = `<svg viewBox="0 0 24 24" fill="${ic.color || '#000'}" aria-hidden="true"><path d="${ic.svg}"/></svg>`;
        else if (ic.img) sp.innerHTML = `<img src="${ic.img}" alt="">`;
        else sp.textContent = ic.text || '';
        el.appendChild(sp); ring.appendChild(el);
      });
      rings.appendChild(ring);
    });
  };

  /* ---------- content blocks ---------- */
  const card = (cls, html) => { const c = document.createElement('div'); c.className = cls; c.innerHTML = html; return c; };
  const projects = () => {
    const g = $('#projects-grid'); g.innerHTML = '';
    S.projects.forEach(p => g.appendChild(card('card' + (p.todo ? ' todo' : ''),
      (p.image ? `<img src="${p.image}" alt="${p.title}">` : '') + `<h3>${p.title}</h3><p>${p.description || ''}</p>` +
      (p.tags && p.tags.length ? '<div class="chips">' + p.tags.map(t => `<span class="chip">${t}</span>`).join('') + '</div>' : '') +
      '<p style="margin-top:12px">' + (p.live ? `<a href="${p.live}" target="_blank" rel="noopener">Live demo &rarr;</a> &nbsp;` : '') +
      (p.repo ? `<a href="${p.repo}" target="_blank" rel="noopener">Code &rarr;</a>` : '') + '</p>')));
  };
  const resume = () => {
    const R = S.resume || {}, g = $('#resume-grid'); g.innerHTML = '';
    [['Experience', R.experience], ['Education', R.education]].forEach(c => {
      if (c[1] && c[1].length) g.appendChild(card('card tl', `<h3>${c[0]}</h3>` + c[1].map(e =>
        `<div class="tl-i${e.todo ? ' todo-i' : ''}"><b>${e.role}</b><span>${e.org} · ${e.period}</span>${e.text ? `<p>${e.text}</p>` : ''}</div>`).join('')));
    });
    $('#cv-btns').innerHTML = R.cvFile ? `<a class="btn p" href="${R.cvFile}" download>⬇ Download CV</a>` : '';
  };
  const testi = () => {
    const T = S.testimonials || [], g = $('#testimonials-grid'); g.innerHTML = ''; $('#testimonials').hidden = !T.length;
    T.forEach(t => g.appendChild(card('card', `<p>“${t.quote}”</p><p style="margin-top:10px"><b>${t.name}</b>${t.role ? ' · ' + t.role : ''}</p>`)));
  };
  let cur = null;
  const tracks = () => {
    const T = (S.music && S.music.tracks) || [], box = $('#tracks'), td = $('#music-todo'); box.innerHTML = ''; if (td) td.hidden = !!T.length;
    T.forEach(t => {
      const d = card('card track', (t.cover ? `<img class="cov" src="${t.cover}" alt="">` : '') + `<button class="pl" aria-label="Play ${t.title}">▶</button><div class="tm"><b>${t.title}</b><div class="bar"><i></i></div></div><div class="tlinks">` +
        (t.links || []).map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join(' ') + `</div><audio preload="none" src="${t.file || ''}"></audio>`);
      const a = $('audio', d), b = $('.pl', d), bar = $('.bar', d), fill = $('.bar i', d);
      b.onclick = () => { if (!t.file) return; if (a.paused) { if (cur && cur !== a) cur.pause(); a.play(); cur = a; } else a.pause(); };
      a.onplay = () => { b.textContent = '❚❚'; }; a.onpause = () => { b.textContent = '▶'; };
      a.ontimeupdate = () => { fill.style.width = (a.currentTime / a.duration * 100 || 0) + '%'; };
      bar.onclick = e => { if (a.duration) a.currentTime = a.duration * e.offsetX / bar.clientWidth; };
      box.appendChild(d);
    });
  };

  /* ---------- gallery + lightbox ---------- */
  let lb = null;
  const lightbox = i => {
    const G = S.gallery; let k = i;
    if (lb) lb.remove();
    lb = document.createElement('div'); lb.className = 'lb';
    lb.innerHTML = '<button class="lbx" aria-label="Close">✕</button><button class="lbp" aria-label="Previous">‹</button><figure><img alt=""><figcaption></figcaption></figure><button class="lbn" aria-label="Next">›</button>';
    const img = $('img', lb), cap = $('figcaption', lb);
    const show = n => { k = (n + G.length) % G.length; img.src = G[k].src; img.alt = G[k].caption || 'Photo'; cap.textContent = G[k].caption || ''; };
    const key = e => { if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(k - 1); if (e.key === 'ArrowRight') show(k + 1); };
    const close = () => { lb.remove(); removeEventListener('keydown', key); };
    $('.lbx', lb).onclick = close; $('.lbp', lb).onclick = () => show(k - 1); $('.lbn', lb).onclick = () => show(k + 1);
    lb.onclick = e => { if (e.target === lb) close(); };
    addEventListener('keydown', key); document.body.appendChild(lb); show(i);
  };
  const gallery = () => {
    const G = S.gallery || [], grid = $('#gallery-grid'); grid.innerHTML = '';
    $('#gallery').hidden = !G.length; $('#navGallery').hidden = !G.length;
    G.forEach((p, i) => {
      const f = document.createElement('figure'); f.className = 'gi';
      f.innerHTML = `<img src="${p.src}" alt="${p.caption || 'Photo'}" loading="lazy">${p.caption ? `<figcaption>${p.caption}</figcaption>` : ''}`;
      f.onclick = () => lightbox(i); grid.appendChild(f);
    });
  };

  /* ---------- typewriter ---------- */
  let tw;
  const typer = () => {
    clearTimeout(tw); const pf = $('#rolePrefix'); if (pf) pf.textContent = S.rolePrefix || "I'm a"; const el = $('#typed'), R = S.roles || []; if (!el || !R.length) return;
    if (reduce || !S.effects.typewriter) { el.textContent = R[0]; return; }
    let i = 0, j = 0, del = false;
    (function tick() {
      const w = R[i]; el.textContent = w.slice(0, j);
      if (!del && j === w.length) { del = true; tw = setTimeout(tick, 1400); return; }
      if (del && j === 0) { del = false; i = (i + 1) % R.length; }
      j += del ? -1 : 1; tw = setTimeout(tick, del ? 35 : 70);
    })();
  };

  /* ---------- background ---------- */
  let gl = null, raf = 0;
  const fxCanvas = (box, B) => {
    const eff = B.effect || (B.glitter ? 'glitter' : 'none');
    if (eff === 'none' || (reduce && eff !== 'glitter')) return;
    const cv = document.createElement('canvas'); box.appendChild(cv);
    const g = cv.getContext && cv.getContext('2d'); if (!g) return;
    let W, H; gl = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; }; gl();
    const n = B.effectAmount || B.glitterCount || 70, R = Math.random, T0 = performance.now();
    const tint = () => (!B.glitterColor || B.glitterColor === 'auto') ? null : B.glitterColor;
    const jag = (x1, y1, x2, y2, seg, amp) => { const p = [[x1, y1]]; for (let i = 1; i < seg; i++) { const f = i / seg; p.push([x1 + (x2 - x1) * f + (R() - .5) * amp, y1 + (y2 - y1) * f + (R() - .5) * amp * .4]); } p.push([x2, y2]); return p; };
    const bolt = (pts, a, c, w) => { g.save(); g.shadowColor = c; g.shadowBlur = 24; g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = w || 2.5; g.lineJoin = 'round'; g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke(); g.restore(); };
    const acc = () => getComputedStyle(root).getPropertyValue('--accent').trim() || '#0a7cff';
    const acc2 = () => getComputedStyle(root).getPropertyValue('--accent2').trim() || '#00b894';
    const ink = a => `rgba(${dark() ? '255,255,255' : '20,30,60'},${a})`;
    const EQ = ['E = mc²', '∫ eˣ dx = eˣ + C', 'Σ 1/n² = π²/6', 'e^(iπ) + 1 = 0', 'a² + b² = c²', 'd/dx sin x = cos x', 'x = (−b ± √(b²−4ac)) / 2a', 'lim sin x / x = 1', '∇·E = ρ/ε₀', 'F = ma', 'P(A|B) = P(B|A)·P(A) / P(B)', 'φ = (1+√5)/2', 'n! = n·(n−1)!', 'det(A) = ad − bc', 'sin²θ + cos²θ = 1', 'F(ω) = ∫ f(t)e^(−iωt) dt', 'Δx → 0', 'π ≈ 3.14159265'];
    const SYM = ['♪', '♫', '♩', '♬', '♭', '♯', '♮'];
    const CODE = [['Python', '#3776ab', 'def fib(n): return n if n < 2 else fib(n-1) + fib(n-2)'], ['Python', '#3776ab', 'print("Hello, World!")'], ['JavaScript', '#d6b900', 'const sum = (a, b) => a + b;'], ['JavaScript', '#d6b900', 'fetch(url).then(r => r.json())'], ['TypeScript', '#3178c6', 'const id: number = 42;'], ['C++', '#00599c', 'std::cout << "Hello" << std::endl;'], ['C', '#a8b9cc', 'printf("%d\\n", x);'], ['Java', '#e76f00', 'public static void main(String[] args) {}'], ['Go', '#00add8', 'func main() { fmt.Println("Hi") }'], ['Rust', '#dea584', 'let mut v: Vec<i32> = Vec::new();'], ['SQL', '#e38c00', 'SELECT name FROM users WHERE id = 1;'], ['HTML', '#e34f26', '<div class="card">Hello</div>'], ['CSS', '#2965f1', '.btn { color: #0a7cff; }'], ['PHP', '#777bb4', '<?php echo "Hello"; ?>'], ['Bash', '#4eaa25', 'nmap -sV 192.168.1.1'], ['Bash', '#4eaa25', 'chmod +x script.sh && ./script.sh'], ['Kotlin', '#7f52ff', 'fun main() = println("Hi")'], ['Swift', '#f05138', 'let name = "Simor"'], ['Ruby', '#cc342d', 'puts "Hello"'], ['R', '#276dc3', 'mean(c(1, 2, 3))']];
    const drift = (gen, count, vmin, vmax) => {
      const sp = init => { const o = gen(); o.x = R() * W; o.y = init ? R() * H : H + 30; o.vy = -(R() * (vmax - vmin) + vmin); o.vx = (R() - .5) * .3; o.p = R() * 6.28; return o; };
      const P = Array.from({ length: count }, () => sp(true));
      return t => {
        g.clearRect(0, 0, W, H);
        P.forEach((q, i) => {
          q.y += q.vy; q.x += q.vx + Math.sin(t * .6 + q.p) * .3;
          if (q.y < -40) { P[i] = sp(false); return; }
          if (q.t0 == null) q.t0 = t;
          g.globalAlpha = q.a * (.55 + .45 * Math.sin(t * .8 + q.p)); g.fillStyle = q.c;
          if (q.tag) { g.font = '10px "Courier New",monospace'; g.fillText(q.tag, q.x, q.y - 15); }
          g.font = q.font; g.fillText(q.type ? q.s.slice(0, Math.max(0, ((t - q.t0) * 16) | 0)) : q.s, q.x, q.y);
        });
        g.globalAlpha = 1;
      };
    };
    const mk = {
      glitter() {
        const P = Array.from({ length: n }, () => ({ x: R(), y: R(), r: R() * 1.8 + .4, p: R() * 6.28, s: R() * .03 + .01, dy: R() * .00008 + .00002 }));
        return () => {
          const col = tint() || (dark() ? '#ffffff' : '#0a7cff');
          g.clearRect(0, 0, W, H); g.fillStyle = g.strokeStyle = g.shadowColor = col;
          P.forEach(q => {
            q.p += q.s; q.y -= q.dy; if (q.y < 0) q.y = 1;
            const x = q.x * W, y = q.y * H;
            g.globalAlpha = .15 + .85 * Math.abs(Math.sin(q.p)); g.shadowBlur = q.r * 6;
            g.beginPath(); g.arc(x, y, q.r, 0, 6.283); g.fill();
            if (q.r > 1.5) { g.lineWidth = .6; g.beginPath(); g.moveTo(x - q.r * 4, y); g.lineTo(x + q.r * 4, y); g.moveTo(x, y - q.r * 4); g.lineTo(x, y + q.r * 4); g.stroke(); }
          });
        };
      },
      snow() {
        const P = Array.from({ length: n * 2 }, () => ({ x: R() * W, y: R() * H, r: R() * 3 + 1, v: R() + .4, p: R() * 6.28 }));
        return t => {
          g.clearRect(0, 0, W, H); g.fillStyle = dark() ? 'rgba(255,255,255,.85)' : 'rgba(120,150,200,.8)';
          P.forEach(q => { q.y += q.v; q.x += Math.sin(t + q.p) * .5; if (q.y > H + 5) { q.y = -5; q.x = R() * W; } g.beginPath(); g.arc(q.x, q.y, q.r, 0, 6.283); g.fill(); });
        };
      },
      rain(heavy) {
        const P = Array.from({ length: Math.round(n * (heavy ? 3 : 2)) }, () => ({ x: R() * W * 1.2, y: R() * H, l: R() * 14 + 8, v: R() * 10 + 12 }));
        const sp = [], wind = heavy ? -5 : -2, c = dark() ? '174,200,235' : '70,110,170';
        return () => {
          g.clearRect(0, 0, W, H); g.strokeStyle = `rgba(${c},.55)`; g.lineWidth = 1.2; g.beginPath();
          P.forEach(q => {
            g.moveTo(q.x, q.y); g.lineTo(q.x + wind * q.l / q.v, q.y + q.l); q.y += q.v; q.x += wind;
            if (q.y > H) { if (R() < .25) sp.push({ x: q.x, r: 1, a: .5 }); q.y = -q.l; q.x = R() * W * 1.2; }
          });
          g.stroke();
          for (let i = sp.length - 1; i >= 0; i--) {
            const s = sp[i]; s.r += .7; s.a -= .03; if (s.a <= 0) { sp.splice(i, 1); continue; }
            g.strokeStyle = `rgba(${c},${s.a})`; g.beginPath(); g.ellipse(s.x, H - 3, s.r * 2, s.r * .6, 0, 0, 6.283); g.stroke();
          }
        };
      },
      storm() {
        const rain = mk.rain(true); let flash = 0, life = 0, b = null, next = 1 + R() * 2;
        return t => {
          rain(t);
          if (t > next) {
            const x = R() * W * .8 + W * .1, main = jag(x, 0, x + (R() - .5) * W * .3, H * (.5 + R() * .4), 14, 70), k = main[5];
            b = { main, br: jag(k[0], k[1], k[0] + (R() - .5) * 300, k[1] + H * .25, 7, 50) }; flash = 1; life = 1; next = t + 2 + R() * 5;
          }
          if (flash > 0) { g.fillStyle = `rgba(255,255,255,${flash * .35})`; g.fillRect(0, 0, W, H); flash -= .06; }
          if (b && life > 0) { bolt(b.main, life, '#9bf', 3); bolt(b.br, life * .8, '#9bf', 1.6); life -= .08; }
        };
      },
      electric() {
        const arcs = [], c = tint() || '#7fdcff'; let next = 0;
        return t => {
          g.clearRect(0, 0, W, H);
          if (t > next) {
            const x1 = R() * W, y1 = R() * H * .3, x2 = x1 + (R() - .5) * W * .6, y2 = y1 + H * (.3 + R() * .5);
            arcs.push({ pts: jag(x1, y1, x2, y2, 16, 90), life: 1 }); next = t + (1.4 - n / 250 * 1.1) * (.4 + R() * 1.2);
          }
          for (let i = arcs.length - 1; i >= 0; i--) {
            const a = arcs[i]; if (a.life <= 0) { arcs.splice(i, 1); continue; }
            g.fillStyle = c; g.globalAlpha = a.life * .06; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
            bolt(a.pts, a.life * (R() * .5 + .5), c, 2); a.life -= .07;
          }
        };
      },
      sun() {
        const N = 6 + Math.round(n / 12);
        return t => {
          g.clearRect(0, 0, W, H); const cx = W * .85, cy = -H * .05, Rr = Math.max(W, H) * 1.6, hue = 38 + 12 * Math.sin(t * .15);
          for (let i = 0; i < N; i++) {
            const a = i * 6.283 / N + t * .06, w = .045 + .02 * Math.sin(t * .5 + i);
            g.fillStyle = `hsla(${hue + (i % 3) * 6},100%,${dark() ? 60 : 55}%,${.05 + .06 * (.5 + .5 * Math.sin(t * .7 + i * 1.7))})`;
            g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a - w) * Rr, cy + Math.sin(a - w) * Rr); g.lineTo(cx + Math.cos(a + w) * Rr, cy + Math.sin(a + w) * Rr); g.closePath(); g.fill();
          }
          const gr = g.createRadialGradient(cx, cy, 0, cx, cy, W * .4);
          gr.addColorStop(0, `hsla(${hue},100%,65%,.4)`); gr.addColorStop(1, `hsla(${hue},100%,65%,0)`); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        };
      },
      math() {
        return drift(() => {
          let q; if (R() < .35) { const a = (R() * 90 + 10) | 0, b = (R() * 9 + 2) | 0, o = ['+', '×', '−'][(R() * 3) | 0]; q = `${a} ${o} ${b} = ${o === '+' ? a + b : o === '×' ? a * b : a - b}`; } else q = EQ[(R() * EQ.length) | 0];
          return { s: q, font: `italic ${(R() * 10 + 15) | 0}px Georgia,serif`, c: tint() || (R() < .5 ? acc() : acc2()), a: .6 };
        }, Math.round(n / 3.5), .15, .45);
      },
      music() {
        return drift(() => ({ s: SYM[(R() * SYM.length) | 0], font: `${(R() * 28 + 18) | 0}px serif`, c: tint() || (R() < .5 ? acc() : ink(1)), a: .6 }), Math.round(n / 3), .2, .7);
      },
      code() {
        return drift(() => { const c = CODE[(R() * CODE.length) | 0]; return { s: c[2], tag: c[0], c: c[1], type: true, font: `${(R() * 3 + 12) | 0}px "Courier New",monospace`, a: .75 }; }, Math.round(n / 4), .12, .4);
      },
      fourier() {
        const hist = [], N = Math.max(2, Math.min(12, Math.round(n / 20)));
        return t => {
          g.clearRect(0, 0, W, H);
          const a1 = acc(), a2 = acc2(), r0 = Math.min(W, H) * .13, cx = Math.min(W * .2, 220), cy = H * .45;
          let x = cx, y = cy; g.lineWidth = 1.2;
          for (let k = 0; k < N; k++) {
            const m = 2 * k + 1, r = r0 * 4 / (Math.PI * m), a = m * t * .9, nx = x + r * Math.cos(a), ny = y + r * Math.sin(a);
            g.globalAlpha = .3; g.strokeStyle = a1; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.stroke();
            g.globalAlpha = .6; g.beginPath(); g.moveTo(x, y); g.lineTo(nx, ny); g.stroke(); x = nx; y = ny;
          }
          hist.unshift(y); if (hist.length > 320) hist.pop();
          const wx = cx + r0 * 2.2;
          g.globalAlpha = .5; g.strokeStyle = a2; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(x, y); g.lineTo(wx, hist[0]); g.stroke(); g.setLineDash([]);
          g.globalAlpha = .75; g.lineWidth = 2; g.beginPath(); hist.forEach((v, k) => k ? g.lineTo(wx + k * 1.6, v) : g.moveTo(wx, v)); g.stroke();
          g.globalAlpha = .7; g.fillStyle = ink(1); g.font = 'italic 15px Georgia,serif'; g.fillText('f(x) = (4/π) Σ sin((2k−1)x) / (2k−1)', cx - r0, cy - r0 * 1.9); g.globalAlpha = 1;
        };
      },
      dsa() {
        let arr = [], i = 0, j = 0, done = 0, last = 0;
        const shuffle = () => { arr = Array.from({ length: 28 }, (_, k) => k + 1).sort(() => R() - .5); i = 0; j = 0; done = 0; };
        shuffle();
        const BO = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'BFS', 'DFS', 'Quick Sort', 'Merge Sort', 'Dijkstra', 'DP', 'Stack', 'Queue', 'Heap', 'Trie', 'Hash Map', 'Binary Search', 'Linked List', 'Recursion'];
        const L = Array.from({ length: Math.round(n / 3) }, () => ({ s: BO[(R() * BO.length) | 0], x: R() * W, y: R() * H, v: R() * .3 + .1, p: R() * 6.28, z: (R() * 8 + 12) | 0 }));
        const vals = Array.from({ length: 15 }, (_, k) => k + 1).sort(() => R() - .5);
        return t => {
          g.clearRect(0, 0, W, H); const a1 = acc(), a2 = acc2(); g.textAlign = 'left';
          L.forEach(q => { q.y -= q.v; if (q.y < -20) { q.y = H + 20; q.x = R() * W; } g.globalAlpha = .12 + .2 * (.5 + .5 * Math.sin(t * .8 + q.p)); g.font = `${q.z}px "Courier New",monospace`; g.fillStyle = ink(1); g.fillText(q.s, q.x, q.y); });
          if (t - last > .04) { last = t; if (!done) { if (arr[j] > arr[j + 1]) { const x = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = x; } j++; if (j >= arr.length - 1 - i) { j = 0; i++; if (i >= arr.length - 1) done = t; } } else if (t - done > 2) shuffle(); }
          const bw = Math.min(W * .4, 340) / arr.length, bx = 24, by = H - 28;
          g.globalAlpha = .7; g.font = '12px "Courier New",monospace'; g.fillStyle = ink(1); g.fillText('Bubble Sort  O(n²)', bx, by - 120);
          arr.forEach((v, k) => { g.globalAlpha = .55; g.fillStyle = done || k >= arr.length - i ? a2 : (k === j || k === j + 1 ? '#ff7a45' : a1); g.fillRect(bx + k * bw, by - v * 3.2, bw - 2, v * 3.2); });
          const tw = Math.min(260, W * .4), cx = W - tw / 2 - 24, ty = H - 200, vis = Math.floor((t * 1.1) % 19);
          g.globalAlpha = .7; g.fillStyle = ink(1); g.textAlign = 'center'; g.fillText('Binary Tree  BFS', cx, ty - 28);
          const pos = k => { const l = Math.floor(Math.log2(k + 1)), c = k - (Math.pow(2, l) - 1); return [cx - tw / 2 + (c + .5) * tw / Math.pow(2, l), ty + l * 44]; };
          g.lineWidth = 1.2;
          for (let k = 1; k < 15; k++) { const p = pos(Math.floor((k - 1) / 2)), c = pos(k); g.globalAlpha = .35; g.strokeStyle = ink(1); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(c[0], c[1]); g.stroke(); }
          for (let k = 0; k < 15; k++) { const q = pos(k); g.globalAlpha = .75; g.fillStyle = k === vis - 1 ? a2 : (k < vis ? a1 : ink(.25)); g.beginPath(); g.arc(q[0], q[1], 11, 0, 6.283); g.fill(); g.globalAlpha = .9; g.fillStyle = '#fff'; g.font = '10px monospace'; g.fillText(vals[k], q[0], q[1] + 3.5); }
          g.textAlign = 'left'; g.globalAlpha = 1;
        };
      },
      fire() {
        const P = [];
        return t => {
          g.clearRect(0, 0, W, H);
          if (P.length < 1600) for (let i = 0, k = Math.max(2, Math.round(n / 10)); i < k; i++) P.push({ x: R() * W, y: H + 10, vx: (R() - .5) * 1.2, vy: -(R() * 3 + 1.5), life: 1, d: R() * .012 + .008, r: R() * 22 + 10 });
          g.globalCompositeOperation = 'lighter';
          for (let i = P.length - 1; i >= 0; i--) {
            const q = P[i]; q.x += q.vx + Math.sin(t * 3 + q.y * .02) * .6; q.y += q.vy; q.life -= q.d;
            if (q.life <= 0) { P.splice(i, 1); continue; }
            const rr = q.r * q.life + 2, gr = g.createRadialGradient(q.x, q.y, 0, q.x, q.y, rr);
            gr.addColorStop(0, `hsla(${20 + 45 * q.life},100%,${50 + 25 * q.life}%,${q.life * .55})`); gr.addColorStop(1, 'hsla(10,100%,40%,0)');
            g.fillStyle = gr; g.beginPath(); g.arc(q.x, q.y, rr, 0, 6.283); g.fill();
          }
          g.globalCompositeOperation = 'source-over';
        };
      }
    };
    const step = (mk[eff] || mk.glitter)();
    const loop = () => { step((performance.now() - T0) / 1000); if (!reduce) raf = requestAnimationFrame(loop); };
    loop();
  };
  const bg = () => {
    cancelAnimationFrame(raf); let box = $('#bg'); if (!box) { box = document.createElement('div'); box.id = 'bg'; document.body.prepend(box); } box.innerHTML = ''; const B = S.background || {};
    const add = (cls, fn) => { const d = document.createElement('div'); d.className = cls; if (fn) fn(d); box.appendChild(d); };
    if (B.image) add('bg-image', d => { d.style.backgroundImage = `url("${B.image}")`; });
    if (B.ambient) add('bg-ambient', d => (B.ambientColors || []).slice(0, 3).forEach(c => { const i = document.createElement('i'); i.style.background = c; d.appendChild(i); }));
    if (B.grain) add('bg-grain');
    if (S.effects.spotlight && !reduce) add('spot');
    fxCanvas(box, B);
  };

  /* ---------- life: mouse, scroll, reveal ---------- */
  let tc = null;
  const tilt = e => {
    const c = e.target.closest && e.target.closest('.card');
    if (tc && tc !== c) { tc.style.setProperty('--rx', '0deg'); tc.style.setProperty('--ry', '0deg'); }
    tc = c; if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - .5) * 8) + 'deg');
    c.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 8) + 'deg');
  };
  addEventListener('mousemove', e => {
    if (S.effects.spotlight) { root.style.setProperty('--mx', e.clientX + 'px'); root.style.setProperty('--my', e.clientY + 'px'); }
    const orb = $('.orbit');
    if (S.effects.parallax && orb && !reduce) orb.style.translate = ((e.clientX / innerWidth - .5) * -16) + 'px ' + ((e.clientY / innerHeight - .5) * -16) + 'px';
    if (S.effects.tilt && !reduce && !document.body.classList.contains('editing-text')) tilt(e);
  }, { passive: true });
  addEventListener('scroll', () => {
    const p = $('#prog'); if (p) p.style.width = (scrollY / Math.max(1, document.body.scrollHeight - innerHeight) * 100) + '%';
  }, { passive: true });
  addEventListener('resize', () => gl && gl());
  let io = null;
  const reveal = () => {
    if (!io && 'IntersectionObserver' in window) io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .12 });
    $$('.card,section h2,section .sub,section:not(.hero) .btns,.social,.xlogo,.gi').filter(e => !e.classList.contains('rv')).forEach(e => {
      e.classList.add('rv'); if (!S.effects.reveal || reduce || !io) e.classList.add('in'); else io.observe(e);
    });
  };
  const fx = () => {
    $('#prog').style.display = S.effects.progressBar ? '' : 'none';
    if (!S.effects.parallax) $('.orbit').style.translate = '';
    if (!S.effects.reveal) $$('.rv').forEach(e => e.classList.add('in'));
    typer();
  };

  /* ---------- editable text ---------- */
  let TX = [];
  const texts = () => {
    TX = $$('main h1,main h2,main h3,main p,main .tag,main .btn').filter(e => !e.closest('[data-noedit],#projects-grid,#resume-grid,#tracks,#testimonials-grid'));
    TX.forEach(e => { e.dataset.o = e.innerHTML.trim(); const t = S.texts[e.dataset.o]; if (t != null) e.innerHTML = t; });
  };
  const editText = on => {
    document.body.classList.toggle('editing-text', on);
    TX.forEach(e => {
      if (on) { e.setAttribute('contenteditable', 'true'); e.oninput = () => { const v = e.innerHTML.trim(); if (v === e.dataset.o) delete S.texts[e.dataset.o]; else S.texts[e.dataset.o] = v; save(); }; }
      else { e.removeAttribute('contenteditable'); e.oninput = null; }
    });
  };

  /* ---------- contact, analytics ---------- */
  const form = () => {
    const f = $('#f'); if (!f) return;
    if ((S.contact || {}).formspree) $('button', f).textContent = 'Send message';
    f.addEventListener('submit', e => {
      e.preventDefault(); const C = S.contact || {}, st = $('#fs');
      if (C.formspree) {
        st.textContent = 'Sending...';
        fetch(C.formspree, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(f) })
          .then(r => { if (!r.ok) throw 0; f.reset(); st.textContent = 'Thank you! Your message was sent.'; })
          .catch(() => { st.textContent = 'Could not send. Please use WhatsApp or email instead.'; });
      } else {
        const t = `Hello Simor, I am ${$('#n').value}.\nSubject: ${$('#s').value}\n\n${$('#m').value}`;
        window.open('https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(t), '_blank');
      }
    });
  };
  const analytics = () => {
    const A = S.analytics || {};
    if (A.plausibleDomain) { const s = document.createElement('script'); s.defer = true; s.dataset.domain = A.plausibleDomain; s.src = 'https://plausible.io/js/script.js'; document.head.appendChild(s); }
    if (A.googleId) {
      const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + A.googleId; document.head.appendChild(s);
      window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); }; gtag('js', new Date()); gtag('config', A.googleId);
    }
  };

  /* ---------- public API (used by the live editor) ---------- */
  const apply = part => {
    const all = !part || part === 'all';
    if (all || part === 'fonts') fonts();
    if (all || part === 'theme') theme();
    if (all || part === 'orbit') orbit();
    if (all) { projects(); resume(); testi(); tracks(); gallery(); }
    if (part === 'gallery') gallery();
    if (part === 'projects') projects();
    if (all || part === 'bg' || part === 'fx') bg();
    if (part === 'fx') fx();
    if (part === 'roles') typer();
    if (all || part === 'projects' || part === 'gallery') { reveal(); if (!all) $$('#projects-grid .rv,#gallery-grid .rv').forEach(e => e.classList.add('in')); }
  };
  const PF = window.PF = { S, save, apply, store, editText };

  form(); texts(); apply(); fx(); analytics();
  const ph = store.get('pf_photo'); if (ph) $('.photo').src = ph;
  $('#themeBtn').onclick = () => { S.theme.mode = dark() ? 'light' : 'dark'; store.set('pf_mode', S.theme.mode); theme(); };
  const loadEditor = () => {
    if (PF.toggle) return PF.toggle();
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'css/editor.css'; document.head.appendChild(l);
    const s = document.createElement('script'); s.src = 'js/editor.js'; document.body.appendChild(s);
  };
  if (S.editor !== false) {
    if (/[?&]edit\b/.test(location.search)) loadEditor();
    addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') { e.preventDefault(); loadEditor(); } });
  }
})();
