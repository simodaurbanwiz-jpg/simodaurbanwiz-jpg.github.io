(function () {
  const PF = window.PF, S = PF.S;
  const $ = (q, c) => (c || document).querySelector(q);
  const h = s => { const d = document.createElement('div'); d.innerHTML = s.trim(); return d.firstElementChild; };
  const A = p => { PF.apply(p); PF.save(); };
  const fld = (l, i) => { const d = h(`<label class="f"><span>${l}<b class="v"></b></span></label>`); d.appendChild(i); return d; };
  const range = (l, o, k, min, max, st, part) => {
    const i = h(`<input type="range" min="${min}" max="${max}" step="${st}">`); i.value = o[k]; const d = fld(l, i), v = $('.v', d); v.textContent = o[k];
    i.oninput = () => { o[k] = +i.value; v.textContent = i.value; A(part); }; return d;
  };
  const text = (l, o, k, part, ev, list) => {
    const i = h('<input type="text">'); i.value = o[k] || ''; if (list) i.setAttribute('list', list);
    i.addEventListener(ev || 'input', () => { o[k] = i.value; A(part); }); return fld(l, i);
  };
  const color = (l, o, k, def, part) => {
    const i = h('<input type="color">'); i.value = /^#/.test(o[k]) ? o[k] : def; i.oninput = () => { o[k] = i.value; A(part); }; return fld(l, i);
  };
  const select = (l, opts, o, k, part) => {
    const i = h('<select>' + opts.map(x => `<option>${x}</option>`).join('') + '</select>'); i.value = o[k] || opts[0];
    i.onchange = () => { o[k] = i.value; A(part); }; return fld(l, i);
  };
  const check = (l, o, k, part) => {
    const d = h('<label class="f c"><input type="checkbox"> ' + l + '</label>'), i = $('input', d); i.checked = !!o[k];
    i.onchange = () => { o[k] = i.checked; A(part); }; return d;
  };
  const button = (l, fn, cls) => { const b = h(`<button class="eb ${cls || ''}">${l}</button>`); b.onclick = fn; return b; };

  const FONTS = ['Space Grotesk', 'Inter', 'Anton', 'Bebas Neue', 'Oswald', 'Poppins', 'Montserrat', 'Raleway', 'Playfair Display', 'Orbitron', 'Syne', 'Righteous', 'Pacifico', 'Press Start 2P'];
  const PRE = {
    'Aurora': { t: { mode: 'dark', accent: '#7c5cff', accent2: '#00e5c3' }, b: { ambient: true, ambientColors: ['#7c5cff', '#00e5c3', '#ff4fd8'], effect: 'glitter', glitterColor: 'auto', grain: false } },
    'Gold Night': { t: { mode: 'dark', accent: '#f5c542', accent2: '#ff8a3d' }, b: { ambient: true, ambientColors: ['#f5c542', '#b8860b', '#7a1f1f'], effect: 'glitter', glitterColor: '#ffd700', grain: true } },
    'Cyber Green': { t: { mode: 'dark', accent: '#00ff9c', accent2: '#00b8ff' }, b: { ambient: true, ambientColors: ['#00ff9c', '#00b8ff', '#003d2e'], effect: 'glitter', glitterColor: '#00ff9c', grain: false } },
    'Sunset': { t: { mode: 'dark', accent: '#ff6b6b', accent2: '#ffb347' }, b: { ambient: true, ambientColors: ['#ff6b6b', '#ffb347', '#c13584'], effect: 'glitter', glitterColor: 'auto', grain: true } },
    'Clean Light': { t: { mode: 'light', accent: '#0a7cff', accent2: '#00b894' }, b: { ambient: false, effect: 'none', grain: false } }
  };
  const FX = { typewriter: 'Typing roles', spotlight: 'Cursor spotlight', tilt: '3D card tilt', reveal: 'Scroll reveal', parallax: 'Photo follows mouse', progressBar: 'Scroll progress bar' };

  const openCrop = im => {
    const SZ = 300, OUT = 600;
    const m = h(`<div class="pfm"><div class="pfc"><b>Crop your photo</b><p class="hint">Drag the picture to move it. Zoom with the slider or mouse wheel. The bright circle is what visitors will see.</p>
      <div class="pfv"><canvas width="${SZ}" height="${SZ}"></canvas></div>
      <label class="f"><span>Zoom</span><input type="range" min=".5" max="4" step=".01" value="1"></label>
      <div class="pfa"><button class="eb pfx">Cancel</button><button class="eb p pfok">Use photo</button></div></div></div>`);
    document.body.appendChild(m);
    const cv = $('canvas', m), g = cv.getContext('2d'), zi = $('input', m), box = $('.pfv', m);
    const base = Math.max(SZ / im.width, SZ / im.height);
    let z = 1, ox = 0, oy = 0;
    const dims = () => [im.width * base * z, im.height * base * z];
    const clamp = () => { const d = dims(), mx = Math.max(0, (d[0] - SZ) / 2), my = Math.max(0, (d[1] - SZ) / 2); ox = Math.max(-mx, Math.min(mx, ox)); oy = Math.max(-my, Math.min(my, oy)); };
    const paint = (c, k) => { clamp(); const d = dims(); c.fillStyle = '#fff'; c.fillRect(0, 0, SZ * k, SZ * k); c.drawImage(im, ((SZ - d[0]) / 2 + ox) * k, ((SZ - d[1]) / 2 + oy) * k, d[0] * k, d[1] * k); };
    const draw = () => paint(g, 1);
    zi.oninput = () => { z = +zi.value; draw(); };
    box.onwheel = e => { e.preventDefault(); z = Math.max(.5, Math.min(4, z - e.deltaY * .002)); zi.value = z; draw(); };
    let drag = null;
    box.onpointerdown = e => { drag = [e.clientX, e.clientY]; try { box.setPointerCapture(e.pointerId); } catch (x) {} box.style.cursor = 'grabbing'; };
    box.onpointermove = e => { if (!drag) return; const k = SZ / (cv.clientWidth || SZ); ox += (e.clientX - drag[0]) * k; oy += (e.clientY - drag[1]) * k; drag = [e.clientX, e.clientY]; draw(); };
    box.onpointerup = box.onpointercancel = () => { drag = null; box.style.cursor = ''; };
    $('.pfx', m).onclick = () => m.remove();
    $('.pfok', m).onclick = () => {
      const o = document.createElement('canvas'); o.width = o.height = OUT; paint(o.getContext('2d'), OUT / SZ);
      const u = o.toDataURL('image/jpeg', .9); PF.store.set('pf_photo', u); $('.photo').src = u; m.remove();
    };
    draw();
  };
  PF.openCrop = openCrop;
  const photo = f => {
    if (!f) return; const r = new FileReader();
    r.onload = () => { const im = new Image(); im.onload = () => openCrop(im); im.src = r.result; };
    r.readAsDataURL(f);
  };
  const dl = (n, t) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t], { type: 'text/plain' })); a.download = n; a.click(); };
  const cfg = () => '// Exported from the live editor\nconst SITE = ' + JSON.stringify(S, null, 2) + ';\n';
  const mv = (i, d) => { const a = S.icons, j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; A('orbit'); show('Icons'); };

  const mvg = (i, d) => { const a = S.gallery, j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; A('gallery'); show('Gallery'); };
  const T = {
    Style() {
      const pr = h('<div class="pre"></div>');
      Object.keys(PRE).forEach(k => pr.append(button(k, () => { Object.assign(S.theme, PRE[k].t); Object.assign(S.background, PRE[k].b); PF.store.del('pf_mode'); A('all'); show('Style'); }, 'sm')));
      const mode = select('Mode', ['auto', 'light', 'dark'], S.theme, 'mode', 'theme');
      $('select', mode).addEventListener('change', () => PF.store.del('pf_mode'));
      return [h('<p class="hint">Quick looks</p>'), pr, mode,
        color('Accent colour', S.theme, 'accent', '#0a7cff', 'theme'), color('Second colour', S.theme, 'accent2', '#00b894', 'theme'),
        h('<p class="hint">Fonts: pick or type any Google Font name</p>'),
        text('Heading font', S.fonts, 'heading', 'fonts', 'change', 'pf-fonts'), text('Body font', S.fonts, 'body', 'fonts', 'change', 'pf-fonts'),
        h('<datalist id="pf-fonts">' + FONTS.map(f => `<option value="${f}">`).join('') + '</datalist>'),
        h('<p class="hint">Life &amp; motion</p>')].concat(Object.keys(FX).map(k => check(FX[k], S.effects, k, 'fx')));
    },
    Background() {
      const B = S.background; B.effect = B.effect || (B.glitter ? 'glitter' : 'none'); B.effectAmount = B.effectAmount || B.glitterCount || 70; const C = B.ambientColors = B.ambientColors || ['#0a7cff', '#00b894', '#8e44ad'];
      return [check('Ambient glow', B, 'ambient', 'bg'), color('Glow colour 1', C, 0, '#0a7cff', 'bg'), color('Glow colour 2', C, 1, '#00b894', 'bg'), color('Glow colour 3', C, 2, '#8e44ad', 'bg'),
        select('Background animation', ['none', 'glitter', 'snow', 'rain', 'storm', 'sun', 'electric', 'fire', 'math', 'fourier', 'dsa', 'music', 'code'], B, 'effect', 'bg'), range('Effect amount', B, 'effectAmount', 10, 250, 5, 'bg'), color('Effect colour (glitter, electric)', B, 'glitterColor', '#ffffff', 'bg'),
        button('Auto effect colour', () => { B.glitterColor = 'auto'; A('bg'); }, 'sm'), check('Textured grain', B, 'grain', 'bg'),
        h('<p class="hint">Background picture: put a file in images/backgrounds/ and set background.image in config.js</p>')];
    },
    Orbit() {
      const O = S.orbit, R = O.rings[0], up = h('<input type="file" accept="image/*">'); up.onchange = () => photo(up.files[0]);
      const d = h('<label class="f c"><input type="checkbox"> Anticlockwise</label>'), ci = $('input', d); ci.checked = R.direction < 0; ci.onchange = () => { R.direction = ci.checked ? -1 : 1; A('orbit'); };
      return [range('Orbit size', O, 'size', 240, 480, 5, 'orbit'), range('Icon size', O, 'iconSize', 24, 80, 1, 'orbit'), range('Photo size %', O, 'photoSize', 40, 80, 1, 'orbit'),
        range('Ring radius', R, 'radius', .3, .48, .01, 'orbit'), range('Seconds per lap', R, 'seconds', 8, 120, 1, 'orbit'), d, h('<p class="hint">Change profile photo. You can crop it to the circle next.</p>'), up];
    },
    Icons() {
      const w = [];
      S.icons.forEach((ic, i) => {
        if (ic.scale == null) ic.scale = 1;
        const c = h('<div class="ic"></div>'), top = h(`<div class="ich"><b>${ic.label || 'Icon'}</b></div>`);
        top.append(button('↑', () => mv(i, -1), 'sm'), button('↓', () => mv(i, 1), 'sm'), button('✕', () => { S.icons.splice(i, 1); A('orbit'); show('Icons'); }, 'sm'));
        c.append(top, range('Size ×', ic, 'scale', .4, 2, .05, 'orbit'), select('Animation', ['none', 'pulse', 'wobble', 'spin', 'bounce'], ic, 'anim', 'orbit')); w.push(c);
      });
      const n = { label: '', url: '', text: '', bg: '#ffffff', color: '#000000' };
      w.push(h('<p class="hint">Add icon (letters or an emoji; use config.js for brand logos)</p>'), text('Label', n, 'label', 'none'), text('Link URL', n, 'url', 'none'), text('Letters / emoji', n, 'text', 'none'),
        color('Badge colour', n, 'bg', '#ffffff', 'none'), color('Text colour', n, 'color', '#000000', 'none'),
        button('+ Add icon', () => { S.icons.push({ label: n.label || 'New', url: n.url, text: n.text || '★', bg: n.bg, color: n.color }); A('orbit'); show('Icons'); }, 'p'));
      return w;
    },
    Projects() {
      const w = [];
      S.projects.forEach((p, i) => {
        const c = h('<div class="ic"></div>'), top = h(`<div class="ich"><b>${p.title || 'Project'}</b></div>`);
        top.append(button('✕', () => { S.projects.splice(i, 1); A('projects'); show('Projects'); }, 'sm'));
        const tg = h('<input type="text">'); tg.value = (p.tags || []).join(', '); tg.oninput = () => { p.tags = tg.value.split(',').map(s => s.trim()).filter(Boolean); A('projects'); };
        c.append(top, text('Title', p, 'title', 'projects'), text('Description', p, 'description', 'projects'), fld('Tags (comma separated)', tg),
          text('Image (images/projects/x.png)', p, 'image', 'projects'), text('Live demo link', p, 'live', 'projects'), text('Code link', p, 'repo', 'projects'));
        c.addEventListener('input', () => { delete p.todo; }); w.push(c);
      });
      w.push(button('+ Add project', () => { S.projects.push({ title: 'New project', description: 'Describe it here.', tags: [], repo: '', live: '' }); A('projects'); show('Projects'); }, 'p'));
      return w;
    },
    Gallery() {
      S.gallery = S.gallery || [];
      const w = [h('<p class="hint">Put pictures in images/gallery/ then add them here, for example images/gallery/me-1.jpg</p>')];
      S.gallery.forEach((p, i) => {
        const c = h('<div class="ic"></div>'), top = h(`<div class="ich"><b>Photo ${i + 1}</b></div>`);
        top.append(button('↑', () => mvg(i, -1), 'sm'), button('↓', () => mvg(i, 1), 'sm'), button('✕', () => { S.gallery.splice(i, 1); A('gallery'); show('Gallery'); }, 'sm'));
        c.append(top, text('Image path', p, 'src', 'gallery', 'change'), text('Caption', p, 'caption', 'gallery')); w.push(c);
      });
      const n = { src: 'images/gallery/', caption: '' };
      w.push(h('<p class="hint">Add a photo</p>'), text('Image path', n, 'src', 'none'), text('Caption', n, 'caption', 'none'),
        button('+ Add photo', () => { if (!n.src || n.src === 'images/gallery/') return; S.gallery.push({ src: n.src, caption: n.caption }); A('gallery'); show('Gallery'); }, 'p'));
      return w;
    },
    Text() {
      const cb = h('<label class="f c"><input type="checkbox"> Click any text on the page to edit it</label>'); $('input', cb).onchange = e => PF.editText(e.target.checked);
      const ta = h('<textarea rows="6"></textarea>'); ta.value = (S.roles || []).join('\n'); ta.oninput = () => { S.roles = ta.value.split('\n').map(x => x.trim()).filter(Boolean); A('roles'); };
      return [fld('Typing roles (one per line)', ta), text('Text before the roles', S, 'rolePrefix', 'roles'), h('<p class="hint">Page text</p>'), cb, h('<p class="hint">Edits are saved in this browser. Go to Save to keep them in your project.</p>'),
        button('Reset text edits', () => { S.texts = {}; PF.save(); location.reload(); })];
    },
    Save() {
      return [h('<p class="hint">1. Download config.js &nbsp; 2. Replace js/config.js in your project &nbsp; 3. Refresh. Your changes are now permanent.</p>'),
        button('⬇ Download config.js', () => dl('config.js', cfg()), 'p'),
        button('Copy config to clipboard', () => navigator.clipboard && navigator.clipboard.writeText(cfg())),
        button('⬇ Download new photo (save as images/profile.jpg)', () => { const u = PF.store.get('pf_photo'); if (!u) return alert('No new photo chosen yet (Orbit tab).'); const a = document.createElement('a'); a.href = u; a.download = 'profile.jpg'; a.click(); }),
        button('Reset everything to the saved files', () => { ['pf_site', 'pf_photo', 'pf_mode'].forEach(k => PF.store.del(k)); location.href = location.pathname; })];
    }
  };

  const panel = h('<aside class="pfp" aria-label="Live editor"><header><b>Live Editor</b><span class="x" role="button" title="Close">✕</span></header><nav class="pft"></nav><div class="pfb"></div></aside>');
  const gear = h('<button class="pfg" title="Open live editor (Ctrl+Shift+E)">⚙ Edit</button>');
  document.body.append(panel, gear);
  const tabs = $('.pft', panel), body = $('.pfb', panel);
  function show(n) {
    Array.from(tabs.children).forEach(b => b.classList.toggle('on', b.textContent === n));
    body.replaceChildren(...T[n]());
  }
  Object.keys(T).forEach(n => { const b = h(`<button>${n}</button>`); b.onclick = () => show(n); tabs.appendChild(b); });
  const open = v => { panel.classList.toggle('open', v); gear.hidden = v; };
  $('.x', panel).onclick = () => open(false); gear.onclick = () => open(true);
  PF.toggle = () => open(!panel.classList.contains('open'));
  open(true); show('Style');
})();
