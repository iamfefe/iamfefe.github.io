/* ============================================================
   Fefe 畫記工具 annotate.js
   用法：頁面在 body 結尾前載入這支 script 即可。
   - 頁面裡若有 id="fa-dock" 的元素，工具列會固定嵌在那裡（例如最上方標題列），
     畫布只蓋住它下方的區域，工具列永遠點得到。
   - 沒有 fa-dock 時，會在右下角出現浮動的筆按鈕。
   快捷鍵：Ctrl+2 畫筆　Ctrl+3 螢光筆　Ctrl+4 橡皮擦　Ctrl+Z 復原　Delete 全部清除　Esc 暫停畫記
   對外 API：window.fefeAnnotate.clear() / .setTool(t) / .bindKeys(document)
   ============================================================ */
(function () {
  if (window.fefeAnnotate) return;

  const COLORS = ['#e8453c', '#2f8cf0', '#161616', '#3fb36b', '#f4b400'];
  const SIZES = { s: 3, m: 6, l: 12 };
  const dock = document.getElementById('fa-dock');

  // ---------- styles ----------
  const css = `
  .fa-root{font-family:"Microsoft JhengHei","微軟正黑體","PingFang TC",sans-serif;user-select:none;-webkit-user-select:none}
  .fa-float{position:fixed;right:22px;bottom:22px;z-index:2147483646}
  .fa-fab{width:58px;height:58px;border-radius:50%;border:0;background:#ec8b5e;box-shadow:0 6px 0 #c9663f,0 10px 18px rgba(0,0,0,.18);cursor:pointer;display:grid;place-items:center;transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .2s}
  .fa-fab:hover{transform:translateY(-3px) rotate(-8deg)}
  .fa-fab:active{transform:translateY(3px);box-shadow:0 2px 0 #c9663f,0 4px 8px rgba(0,0,0,.18)}
  .fa-fab svg{width:30px;height:30px}
  .fa-float.open .fa-fab{display:none}
  .fa-panel{display:none;background:#fbf8f2;border:1px solid #ddd4c6;border-radius:18px;box-shadow:0 12px 30px rgba(0,0,0,.16);padding:10px;width:max-content;animation:fa-pop .35s cubic-bezier(.34,1.56,.64,1)}
  .fa-float.open .fa-panel{display:block}
  @keyframes fa-pop{from{opacity:0;transform:scale(.8) translateY(10px)}}
  .fa-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 2px 8px;cursor:move;font-size:12px;font-weight:700;color:#5f5a52;letter-spacing:.05em}
  .fa-head .fa-grip{display:flex;gap:3px}.fa-head .fa-grip i{width:4px;height:4px;border-radius:50%;background:#c9bfae}
  .fa-row{display:flex;gap:6px;align-items:center}
  .fa-float .fa-row + .fa-row{margin-top:8px;padding-top:8px;border-top:1px solid #ebe4d8}
  .fa-btn{width:40px;height:40px;border-radius:12px;border:1px solid #ddd4c6;background:#fff;cursor:pointer;display:grid;place-items:center;color:#161616;padding:0;transition:transform .25s cubic-bezier(.34,1.56,.64,1),background .15s,border-color .15s}
  .fa-btn:hover{transform:translateY(-2px) rotate(-4deg)}
  .fa-btn:active{transform:scale(.92)}
  .fa-btn.on{background:#161616;color:#fff;border-color:#161616}
  .fa-btn svg{width:20px;height:20px}
  .fa-btn[disabled]{opacity:.35;pointer-events:none}
  .fa-color{width:26px;height:26px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1px #ddd4c6;cursor:pointer;flex:none;transition:transform .25s cubic-bezier(.34,1.56,.64,1)}
  .fa-color:hover{transform:scale(1.15)}
  .fa-color.on{box-shadow:0 0 0 2.5px #161616;transform:scale(1.1)}
  .fa-size{width:30px;height:30px;border-radius:10px;border:1px solid #ddd4c6;background:#fff;cursor:pointer;display:grid;place-items:center;padding:0;flex:none}
  .fa-size i{display:block;border-radius:50%;background:#161616}
  .fa-size.on{border-color:#161616;box-shadow:inset 0 0 0 1px #161616}
  .fa-sep{width:1px;height:26px;background:#ebe4d8;margin:0 2px;flex:none}
  /* docked in a top bar */
  .fa-docked .fa-panel{display:flex;align-items:center;gap:6px;background:none;border:0;box-shadow:none;padding:0;animation:none;width:auto}
  .fa-docked .fa-head{display:none}
  .fa-docked .fa-btn{width:34px;height:34px;border-radius:10px}
  .fa-docked .fa-btn svg{width:18px;height:18px}
  .fa-docked .fa-color{width:22px;height:22px;border-width:2.5px}
  .fa-docked .fa-size{width:26px;height:26px;border-radius:8px}
  .fa-docked [data-act="close"]{display:none}
  .fa-canvas{position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:2147483645;pointer-events:none;touch-action:none}
  .fa-canvas.active{pointer-events:auto;cursor:crosshair}
  .fa-canvas.erasing{cursor:cell}
  .fa-hint{position:fixed;left:50%;top:76px;transform:translateX(-50%);z-index:2147483646;background:#161616;color:#fff;font:700 13px "Microsoft JhengHei",sans-serif;padding:7px 16px;border-radius:999px;opacity:0;transition:opacity .3s;pointer-events:none}
  .fa-hint.show{opacity:.88}
  @media print{.fa-root,.fa-hint,.fa-canvas{display:none}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // ---------- icons ----------
  const I = {
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l4-1L19 8a2.1 2.1 0 0 0-3-3L5 16z"/><path d="M14 7l3 3"/></svg>',
    hl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14l-4 4v2h4l4-4"/><path d="M9 14l7-9 4 4-9 7z"/><path d="M4 22h16" opacity=".5"/></svg>',
    eraser: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h13"/><path d="M4.5 15.5 14 6a2 2 0 0 1 3 0l3 3a2 2 0 0 1 0 3l-8 8H9z"/><path d="M9 11l5 5"/></svg>',
    undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    fab: '<svg viewBox="0 0 32 32"><path d="M7 25l1.5-5.5L21 7a3 3 0 0 1 4 4L12.5 23.5z" fill="#f8ead8"/><path d="M19 9l4 4" stroke="#c9663f" stroke-width="2" stroke-linecap="round"/><path d="M7 25l1.5-5.5 4 4z" fill="#3b2a24"/><path d="M5 28h10" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/></svg>'
  };

  // ---------- DOM ----------
  const canvas = document.createElement('canvas'); canvas.className = 'fa-canvas';
  const ctx = canvas.getContext('2d');
  const hint = document.createElement('div'); hint.className = 'fa-hint';
  const root = document.createElement('div');
  root.className = 'fa-root ' + (dock ? 'fa-docked' : 'fa-float');
  root.innerHTML = `
    ${dock ? '' : `<button class="fa-fab" title="畫記工具 (Ctrl+2)" aria-label="開啟畫記工具">${I.fab}</button>`}
    <div class="fa-panel" role="toolbar" aria-label="畫記工具">
      <div class="fa-head"><span class="fa-grip"><i></i><i></i><i></i></span><span>畫記工具</span><span class="fa-grip"><i></i><i></i><i></i></span></div>
      <div class="fa-row">
        <button class="fa-btn" data-tool="pen" title="畫筆 (Ctrl+2)">${I.pen}</button>
        <button class="fa-btn" data-tool="hl" title="螢光筆 (Ctrl+3)">${I.hl}</button>
        <button class="fa-btn" data-tool="eraser" title="橡皮擦 (Ctrl+4)">${I.eraser}</button>
        <span class="fa-sep"></span>
        <button class="fa-btn" data-act="undo" title="復原 (Ctrl+Z)">${I.undo}</button>
        <button class="fa-btn" data-act="clear" title="全部清除 (Delete)">${I.trash}</button>
        <button class="fa-btn" data-act="close" title="收起並結束畫記 (Esc)">${I.close}</button>
      </div>
      ${dock ? '<span class="fa-sep"></span>' : ''}
      <div class="fa-row">
        ${COLORS.map(c => `<span class="fa-color" data-color="${c}" style="background:${c}" title="顏色"></span>`).join('')}
        <span class="fa-sep"></span>
        ${Object.entries(SIZES).map(([k, v]) => `<button class="fa-size" data-size="${k}" title="粗細"><i style="width:${Math.min(v + 2, 14)}px;height:${Math.min(v + 2, 14)}px"></i></button>`).join('')}
      </div>
    </div>`;
  document.body.append(canvas, hint);
  (dock || document.body).appendChild(root);

  // ---------- state ----------
  let tool = null;          // null = 不在畫記模式
  let color = COLORS[0];
  let size = 'm';
  const strokes = [];       // {tool,color,width,pts:[[x,y],...]}  (canvas coordinates)
  let cur = null;
  let top = 0;              // canvas offset from viewport top (height of the docked bar)

  const $ = s => root.querySelector(s);
  const $$ = s => [...root.querySelectorAll(s)];

  function fit() {
    top = 0;
    if (dock) {
      const bar = dock.closest('header') || dock;
      top = Math.max(0, Math.round(bar.getBoundingClientRect().bottom));
    }
    const h = innerHeight - top;
    const dpr = window.devicePixelRatio || 1;
    canvas.style.top = top + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }

  function drawStroke(s) {
    const p = s.pts; if (!p.length) return;
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = s.color; ctx.fillStyle = s.color;
    ctx.lineWidth = s.width;
    if (s.tool === 'hl') { ctx.globalAlpha = .35; ctx.lineCap = 'square'; }
    if (p.length === 1) {
      ctx.beginPath(); ctx.arc(p[0][0], p[0][1], s.width / 2, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
      for (let i = 1; i < p.length - 1; i++) {
        const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2;
        ctx.quadraticCurveTo(p[i][0], p[i][1], mx, my);
      }
      const l = p[p.length - 1]; ctx.lineTo(l[0], l[1]); ctx.stroke();
    }
    ctx.restore();
  }
  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach(drawStroke);
    if (cur) drawStroke(cur);
    $('[data-act="undo"]').disabled = !strokes.length;
    $('[data-act="clear"]').disabled = !strokes.length;
  }

  function eraseAt(x, y) {
    const r = 14;
    for (let i = strokes.length - 1; i >= 0; i--) {
      const s = strokes[i], rr = r + s.width / 2;
      if (s.pts.some(([px, py]) => (px - x) ** 2 + (py - y) ** 2 < rr * rr)) strokes.splice(i, 1);
    }
    redraw();
  }

  let hintTimer;
  function say(t) { hint.style.top = (top + 12) + 'px'; hint.textContent = t; hint.classList.add('show'); clearTimeout(hintTimer); hintTimer = setTimeout(() => hint.classList.remove('show'), 1600); }

  function setTool(t, quiet) {
    tool = t;
    $$('[data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === t));
    canvas.classList.toggle('active', !!t);
    canvas.classList.toggle('erasing', t === 'eraser');
    if (t && !dock) root.classList.add('open');
    if (quiet) return;
    say(t === 'pen' ? '畫筆：直接在畫面上畫' : t === 'hl' ? '螢光筆：劃重點' : t === 'eraser' ? '橡皮擦：碰到的線條會整條消失' : '畫記暫停，可以正常操作網頁');
  }
  const toggle = t => setTool(tool === t ? null : t);
  function setColor(c) { color = c; $$('[data-color]').forEach(b => b.classList.toggle('on', b.dataset.color === c)); if (!tool || tool === 'eraser') setTool('pen'); }
  function setSize(k) { size = k; $$('[data-size]').forEach(b => b.classList.toggle('on', b.dataset.size === k)); }
  function undo() { strokes.pop(); redraw(); }
  function clearAll(quiet) { if (!strokes.length) return; strokes.length = 0; cur = null; redraw(); if (!quiet) say('已全部清除'); }
  function closeAll() { setTool(null); if (!dock) root.classList.remove('open'); }

  // ---------- drawing ----------
  const pt = e => [e.clientX, e.clientY - top];
  canvas.addEventListener('pointerdown', e => {
    if (!tool) return;
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    if (tool === 'eraser') { eraseAt(...pt(e)); return; }
    const w = tool === 'hl' ? SIZES[size] * 3 + 6 : SIZES[size];
    cur = { tool, color, width: w, pts: [pt(e)] };
    redraw();
  });
  canvas.addEventListener('pointermove', e => {
    if (!tool || !(e.buttons & 1)) return;
    if (tool === 'eraser') { eraseAt(...pt(e)); return; }
    if (!cur) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    evs.forEach(ev => cur.pts.push(pt(ev)));
    redraw();
  });
  const end = () => { if (cur) { strokes.push(cur); cur = null; redraw(); } };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  // ---------- toolbar ----------
  const fab = $('.fa-fab');
  if (fab) fab.addEventListener('click', () => { root.classList.add('open'); setTool('pen'); });
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-tool],[data-act],[data-color],[data-size]'); if (!b) return;
    if (b.dataset.tool) toggle(b.dataset.tool);
    else if (b.dataset.color) setColor(b.dataset.color);
    else if (b.dataset.size) setSize(b.dataset.size);
    else if (b.dataset.act === 'undo') undo();
    else if (b.dataset.act === 'clear') clearAll();
    else if (b.dataset.act === 'close') closeAll();
  });

  // floating mode: drag the panel / button around
  if (!dock) (function drag() {
    let sx, sy, sr, sb, moved = false, dragging = false;
    const start = e => {
      if (e.target.closest('.fa-btn,.fa-color,.fa-size')) return;
      dragging = true; moved = false;
      sx = e.clientX; sy = e.clientY;
      sr = parseFloat(root.style.right) || 22; sb = parseFloat(root.style.bottom) || 22;
      e.currentTarget.setPointerCapture(e.pointerId);
    };
    const move = e => {
      if (!dragging) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      root.style.right = Math.max(4, Math.min(innerWidth - 70, sr - dx)) + 'px';
      root.style.bottom = Math.max(4, Math.min(innerHeight - 70, sb - dy)) + 'px';
    };
    const stop = () => { dragging = false; };
    [$('.fa-head'), fab].forEach(el => {
      el.addEventListener('pointerdown', start);
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', stop);
    });
    fab.addEventListener('click', e => { if (moved) { e.stopImmediatePropagation(); moved = false; } }, true);
  })();

  // ---------- keyboard ----------
  function onKey(e) {
    const k = e.key.toLowerCase();
    const mod = e.ctrlKey || e.metaKey;
    // Ctrl+2/3/4 work everywhere, even while typing
    if (mod && !e.altKey && !e.shiftKey && (e.code === 'Digit2' || e.code === 'Digit3' || e.code === 'Digit4' || k === '2' || k === '3' || k === '4')) {
      e.preventDefault();
      const n = e.code ? e.code.slice(-1) : k;
      toggle(n === '2' ? 'pen' : n === '3' ? 'hl' : 'eraser');
      return;
    }
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (mod && k === 'z') { if (strokes.length) { e.preventDefault(); undo(); } return; }
    if (mod || e.altKey) return;
    if ((k === 'delete' || k === 'backspace') && (tool || dock)) { if (strokes.length) { e.preventDefault(); clearAll(); } }
    else if (k === 'escape' && tool) closeAll();
  }
  function bindKeys(doc) { try { doc.addEventListener('keydown', onKey, true); } catch (_) { /* cross-origin */ } }
  bindKeys(document);

  addEventListener('resize', fit);
  $$('[data-color]')[0].classList.add('on');
  setSize('m');
  fit();

  window.fefeAnnotate = { clear: () => clearAll(true), setTool: t => setTool(t, true), bindKeys, refit: fit };
})();
