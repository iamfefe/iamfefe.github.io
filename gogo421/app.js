/* GoGo421 自學版（純靜態・無後端） */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const QMAP = Object.fromEntries(window.G421.questions.map(q => [q.id, q]));
const SUBJS = window.G421.subjects;
const S = {
  round: null, mode: "review", subject: "all", wi: null, part: null, count: 20,
  sound: localStorage.getItem("g421sound") !== "0",
  nomotion: localStorage.getItem("g421motion") === "0",
  timer: null,
};
const STEP = [1, 3, 7, 14];
const LET = ["A", "B", "C", "D", "E"];

/* ---------- localStorage ---------- */
function today() {
  return new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
}
function plusDay(n) {
  return new Date(Date.now() + 8 * 3600e3 + n * 864e5).toISOString().slice(0, 10);
}
function getWB() { try { return JSON.parse(localStorage.getItem("g421wb") || "{}"); } catch (e) { return {}; } }
function setWB(w) { localStorage.setItem("g421wb", JSON.stringify(w)); }
function saveRound() {
  if (S.round) localStorage.setItem("g421round", JSON.stringify(S.round));
  else localStorage.removeItem("g421round");
}
function loadRound() { try { return JSON.parse(localStorage.getItem("g421round") || "null"); } catch (e) { return null; } }

/* ---------- 音效／彩帶／工具（與正式版同款） ---------- */
let AC;
function beep(freq, dur = .12, type = "sine", when = 0, gain = .18) {
  if (!S.sound) return;
  AC = AC || new (window.AudioContext || window.webkitAudioContext)();
  const t = AC.currentTime + when;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(.001, t + dur);
  o.connect(g).connect(AC.destination);
  o.start(t); o.stop(t + dur);
}
const snd = {
  tap: () => beep(600, .06, "triangle", 0, .08),
  ok: () => { beep(659, .1, "sine"); beep(988, .18, "sine", .09); },
  bad: () => { beep(196, .18, "square", 0, .12); beep(150, .2, "square", .12, .12); },
  win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => beep(f, .22, "triangle", i * .11)),
};
function toast(msg, ms = 2200) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("on");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), ms);
}
function show(id) {
  $$(".view").forEach(v => v.classList.remove("on"));
  $(id).classList.add("on");
}
function esc(s) { return (s || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function renderRich(el, text, imgBase) {
  el.innerHTML = "";
  const parts = (text || "").split(/(\{\{img:[^}]+\}\})/);
  for (const p of parts) {
    const m = p.match(/^\{\{img:([^}]+)\}\}$/);
    if (m) {
      const im = document.createElement("img");
      const isSub = /\/s_p\d+_\d+\.png$/.test(m[1]);
      im.className = isSub ? "qimg sub" : "qimg";
      im.src = imgBase + m[1]; im.alt = "題圖（點一下放大）";
      im.onclick = e => { e.stopPropagation(); zoom(m[1]); };
      el.appendChild(im);
    } else el.appendChild(document.createTextNode(p));
  }
}
function zoom(path) {
  $("#lb-img").src = "images/" + path;
  $("#lightbox").classList.remove("hidden");
}
function mmss(s) {
  const m = Math.floor(s / 60), ss = s % 60;
  return `${m}:${String(ss).padStart(2, "0")}`;
}
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.random() * (i + 1) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function syncToggles() {
  $("#btn-sound").textContent = S.sound ? "🔊" : "🔇";
  $("#btn-sound").classList.toggle("off", !S.sound);
  $("#btn-motion").textContent = S.nomotion ? "🐢" : "✨";
  $("#btn-motion").classList.toggle("off", S.nomotion);
  document.body.classList.toggle("no-motion", S.nomotion);
}
$("#btn-sound").onclick = () => { S.sound = !S.sound; localStorage.setItem("g421sound", S.sound ? "1" : "0"); syncToggles(); if (S.sound) snd.tap(); };
$("#btn-motion").onclick = () => { S.nomotion = !S.nomotion; localStorage.setItem("g421motion", S.nomotion ? "0" : "1"); syncToggles(); };
$("#lightbox").onclick = () => $("#lightbox").classList.add("hidden");
function confetti(big = false) {
  if (S.nomotion) return;
  const cv = $("#confetti"), ctx = cv.getContext("2d");
  cv.width = innerWidth; cv.height = innerHeight;
  const N = big ? 220 : 90, cols = ["#6a5cff", "#ff5f9e", "#ffd43b", "#12b886", "#ff8f1f", "#4dabf7"];
  const ps = Array.from({ length: N }, () => ({
    x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * .5,
    w: 6 + Math.random() * 8, h: 8 + Math.random() * 10,
    c: cols[Math.random() * cols.length | 0], v: 2 + Math.random() * 4,
    r: Math.random() * 6, dr: -.2 + Math.random() * .4, sw: Math.random() * 6,
  }));
  let t0 = performance.now();
  (function loop(t) {
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (const p of ps) {
      p.y += p.v; p.sw += .12; p.r += p.dr;
      ctx.save(); ctx.translate(p.x + Math.sin(p.sw) * 20, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    }
    if (t - t0 < (big ? 4200 : 2400)) requestAnimationFrame(loop);
    else ctx.clearRect(0, 0, cv.width, cv.height);
  })(t0);
}

/* ---------- 出題 ---------- */
function poolOf(subj, wi, part) {
  return window.G421.questions
    .filter(q => (subj === "all" || q.s === subj) && (!wi || q.wi === wi) && (!part || q.g === part))
    .map(q => q.id);
}
function quotaPool(n) {
  const tot = window.G421.questions.length;
  const by = {};
  for (const q of window.G421.questions) (by[q.s] = by[q.s] || []).push(q.id);
  const picked = [];
  let left = n;
  const take = {};
  for (const k in by) {
    const q = Math.min(by[k].length, Math.floor(n * by[k].length / tot));
    take[k] = q; left -= q;
  }
  for (const k of Object.keys(take).sort((a, b) => by[b].length - by[a].length)) {
    if (left <= 0) break;
    take[k]++; left--;
  }
  for (const k in take) picked.push(...shuffle(by[k].slice()).slice(0, take[k]));
  return shuffle(picked).slice(0, n);
}
function wrongPool(subj, wi, part, n) {
  const wb = getWB(), t = today();
  let ids = Object.keys(wb);
  if (subj !== "all") ids = ids.filter(id => QMAP[id] && QMAP[id].s === subj);
  if (wi) ids = ids.filter(id => QMAP[id] && QMAP[id].wi === wi);
  if (part) ids = ids.filter(id => QMAP[id] && QMAP[id].g === part);
  const due = ids.filter(id => wb[id].due <= t);
  const rest = shuffle(ids.filter(id => !due.includes(id)));
  const order = shuffle(due).concat(rest);
  if (order.length) return order.slice(0, n);
  return shuffle(poolOf(subj, wi, part)).slice(0, n);
}
function startRound() {
  let ids;
  if (S.mode === "quiz") ids = (S.subject === "all" && !S.wi) ? quotaPool(50) : shuffle(poolOf(S.subject, S.wi, S.part)).slice(0, 50);
  else if (S.mode === "wrong" || S.mode === "daily") ids = wrongPool(S.subject, S.wi, S.part, S.count);
  else ids = shuffle(poolOf(S.subject, S.wi, S.part)).slice(0, S.count);
  if (!ids.length) { toast("沒有可練習的題目"); return; }
  S.round = {
    mode: S.mode, subject: S.subject, queue: ids, pos: 0,
    base: {}, first: {}, pending: {}, elapsed: 0, started: Date.now(),
    doneBase: 0,
  };
  for (const id of ids) S.round.base[id] = 1;
  saveRound();
  show("#v-quiz");
  renderQ();
}

/* ---------- 渲染題目 ---------- */
function renderQ() {
  const r = S.round;
  const id = r.queue[r.pos];
  const q = QMAP[id];
  if (!q) { finish(); return; }
  S.answered = false;
  const inBase = r.first[id] === undefined;
  $("#q-phase").textContent = inBase ? "基本題" : "🔥 錯題加強";
  $("#q-phase").className = "badge" + (inBase ? "" : " re");
  r.doneBase = Object.keys(r.first).length;
  $("#q-prog").textContent = `${Math.min(r.pos + 1, r.queue.length)} / ${r.queue.length}`;
  const totalBase = Object.keys(r.base).length;
  $("#q-fill").style.width = (100 * r.doneBase / totalBase) + "%";
  startTimer();
  $("#q-stem").innerHTML = "";
  const tag = document.createElement("div");
  tag.className = "sub"; tag.style.marginBottom = "4px";
  const sname = (SUBJS.find(s => s.code === q.s) || {}).name || q.s;
  tag.textContent = `${sname}｜工作項目${(q.wi || "").slice(0, 2)}｜來源 p${q.p}`;
  $("#q-stem").appendChild(tag);
  const body = document.createElement("div");
  renderRich(body, q.stem, "images/");
  $("#q-stem").appendChild(body);

  const box = $("#q-opts"); box.innerHTML = "";
  const order = q.lock ? q.opts.map((_, i) => i) : shuffle(q.opts.map((_, i) => i));
  S.order = order;
  order.forEach((oi, disp) => {
    const b = document.createElement("button");
    b.className = "opt"; b.dataset.i = oi;
    const k = document.createElement("span"); k.className = "k"; k.textContent = LET[disp];
    const t = document.createElement("span"); t.style.flex = "1";
    renderRich(t, q.opts[oi], "images/");
    b.append(k, t);
    b.onclick = () => {
      if (S.answered) return;
      $$("#q-opts .opt").forEach(x => x.classList.remove("sel"));
      b.classList.add("sel"); snd.tap();
      answer(oi);
    };
    box.appendChild(b);
  });
  $("#q-feed").className = "feed hidden";
  $("#btn-next").classList.add("hidden");
}
function startTimer() {
  clearInterval(S.timer);
  const r = S.round;
  const tick = () => {
    r.elapsed = (r.elapsedBase || 0) + Math.floor((Date.now() - r.started) / 1000);
    $("#q-timer").textContent = "⏱ " + mmss(r.elapsed);
  };
  r.started = Date.now();
  tick();
  S.timer = setInterval(tick, 1000);
}

/* ---------- 作答（含錯題重插機制） ---------- */
function answer(oi) {
  const r = S.round;
  const id = r.queue[r.pos], q = QMAP[id];
  S.answered = true;
  $$("#q-opts .opt").forEach(b => b.disabled = true);
  const correct = oi === q.ans;
  const opts = $$("#q-opts .opt");
  const dispAns = S.order.indexOf(q.ans);
  opts[dispAns]?.classList.add("ok");
  if (!correct) opts[S.order.indexOf(oi)]?.classList.add("bad");

  const wb = getWB();
  if (r.first[id] === undefined) r.first[id] = correct ? 1 : 0;

  if (correct) {
    const p = r.pending[id];
    if (p) {
      p.st = (p.st || 0) + 1;
      if (p.st >= 2) { delete r.pending[id]; r.reinforced = (r.reinforced || 0) + 1; }
      else {
        const gap = 3 + (Math.random() * 3 | 0);
        const at = Math.min(r.pos + 1 + gap, r.queue.length);
        r.queue.splice(at, 0, id);
      }
    }
    const w = wb[id];
    if (w) {
      w.ok = (w.ok || 0) + 1;
      if (w.ok >= 2) {
        w.ok = 0; w.step = (w.step || 0) + 1;
        if (w.step >= STEP.length) delete wb[id];
        else w.due = plusDay(STEP[w.step]);
      }
      setWB(wb);
    }
    snd.ok();
  } else {
    const w = wb[id] || { n: 0, ok: 0, step: 0, due: today() };
    w.n++; w.ok = 0; w.step = 0; w.due = plusDay(1);
    wb[id] = w; setWB(wb);
    const gap = 3 + (Math.random() * 3 | 0);
    const at = Math.min(r.pos + 1 + gap, r.queue.length);
    if (!(id in r.pending)) {
      r.pending[id] = { st: 0 };
      r.queue.splice(at, 0, id);
    } else {
      r.pending[id].st = 0;
    }
    snd.bad();
  }
  saveRound();

  const f = $("#q-feed");
  f.className = "feed " + (correct ? "ok" : "bad");
  let h = correct ? '<b class="t">✅ 答對了！</b>' :
    `<b class="t">❌ 正確答案是選項 ${LET[dispAns]}</b>`;
  if (!correct) {
    if (q.cards.length) {
      h += q.cards.map(c => {
        const tag = c[3] === "auto"
          ? '<span class="hsrc auto">⚡GoGo自動解析</span>'
          : '<span class="hsrc book">📖名師速記</span>';
        return `<div class="hint-card">${tag}<div class="q">${esc(c[0])}</div><div>${esc(c[1])}</div>` +
          (c[2] ? `<div class="mn">${esc(c[2])}</div>` : "") + "</div>";
      }).join("");
    } else {
      h += `<div class="hint-card">正確選項：<b>${esc(q.opts[q.ans])}</b>（這題沒有解析卡，記住選項內容！）</div>`;
    }
    h += `<div class="sub" style="margin-top:6px">本題 3~5 題後會再出現，連對 2 次才算过关 💪</div>`;
  }
  f.innerHTML = h;
  $("#btn-next").classList.remove("hidden");
  if (!correct) setTimeout(() => $("#q-feed").scrollIntoView({ block: "nearest", behavior: S.nomotion ? "auto" : "smooth" }), 60);
}
$("#btn-next").onclick = () => {
  const r = S.round;
  r.elapsedBase = (r.elapsedBase || 0) + Math.floor((Date.now() - r.started) / 1000);
  r.pos++;
  saveRound();
  if (r.pos >= r.queue.length) finish();
  else renderQ();
};
$("#btn-quit").onclick = () => {
  if (!confirm("要離開本輪嗎？進度已存在這台裝置，下次回來可續答。")) return;
  clearInterval(S.timer);
  show("#v-home");
  renderHome();
};

/* ---------- 結算 ---------- */
function finish() {
  clearInterval(S.timer);
  const r = S.round;
  const total = Object.keys(r.base).length;
  const firstOk = Object.values(r.first).filter(v => v === 1).length;
  const wrongN = Object.keys(r.first).filter(k => r.first[k] === 0).length;
  const sc = S.mode === "quiz" ? firstOk * 2 : Math.round(100 * firstOk / total);
  show("#v-result");
  const tier = sc === 100 ? 3 : sc >= 80 ? 2 : sc >= 60 ? 1 : 0;
  const T = [
    ["🌱", "別灰心，錯題就是你的升級地圖！"],
    ["😀", "及格！穩穩的前進！"],
    ["🤩", "超強！八成以上的實力！"],
    ["🏆", "滿分！無與倫比！"],
  ][tier];
  $("#r-emoji").textContent = T[0];
  $("#r-title").textContent = T[1];
  $("#r-score").textContent = sc + " 分";
  $("#r-stats").innerHTML =
    `<div><b>${total}</b>基本題</div><div><b>${firstOk}</b>首答對</div>` +
    `<div><b>${wrongN}</b>錯題</div><div><b>${mmss(r.elapsed)}</b>用時</div>`;
  S.round = null;
  saveRound();
  if (tier >= 1) confetti(tier === 3);
  if (tier === 3) snd.win(); else if (tier >= 1) snd.ok();
}
$("#btn-again").onclick = startRound;
$("#btn-rhome").onclick = () => { show("#v-home"); renderHome(); };

/* ---------- 錯題本 ---------- */
function renderWB() {
  show("#v-wb");
  const wb = getWB(), t = today();
  const ids = Object.keys(wb).sort((a, b) => (wb[a].due < wb[b].due ? -1 : 1));
  const due = ids.filter(id => wb[id].due <= t).length;
  $("#wb-sum").textContent = ids.length
    ? `共 ${ids.length} 題待消灭，其中 ${due} 題今天到期。連對 2 次前进一格（1→3→7→14 天），四格全過就出院！`
    : "錯題本空空如也——太厲害了！🎉";
  const box = $("#wb-list"); box.innerHTML = "";
  for (const id of ids.slice(0, 200)) {
    const q = QMAP[id]; if (!q) continue;
    const w = wb[id];
    const d = document.createElement("div");
    d.className = "hint-card";
    d.innerHTML = `<div class="q">${esc(q.stem.slice(0, 60))}${q.stem.length > 60 ? "…" : ""}</div>
      <div class="sub">已錯 ${w.n} 次｜${w.due <= t ? "⏰ 今天到期" : w.due + " 到期"}｜復習进度 ${w.step || 0}/4</div>`;
    box.appendChild(d);
  }
}
$("#btn-wb").onclick = renderWB;
$("#btn-wb-back").onclick = () => { show("#v-home"); renderHome(); };
$("#btn-clear").onclick = () => {
  if (!confirm("確定清空這台裝置上的錯題本？（不影響題目，只清練習紀錄）")) return;
  localStorage.removeItem("g421wb");
  toast("錯題本已清空 🧹");
  renderHome();
};

/* ---------- 首頁 ---------- */
function renderHome() {
  clearInterval(S.timer);
  const wb = getWB(), t = today();
  const due = Object.values(wb).filter(w => w.due <= t).length;
  $("#due-badge").textContent = due > 0
    ? `📬 債主上門！${due} 題錯題今天到期，再不練它們要長大了！`
    : (Object.keys(wb).length ? "今天沒債要還，去衝新題耍廢！😎" : "你的錯題本比你的口袋還空，快去測驗！💸");
  const subs = $("#subj-chips"); subs.innerHTML = "";
  const items = [["all", `全部 <small>${window.G421.questions.length}題</small>`],
    ...SUBJS.map(s => [s.code, `${s.name} <small>${s.count}題</small>`])];
  for (const [k, v] of items) {
    const b = document.createElement("button");
    b.className = "chip" + (k === S.subject ? " on" : "");
    b.innerHTML = v;
    b.onclick = () => { S.subject = k; S.wi = null; S.part = null; renderHome(); snd.tap(); };
    subs.appendChild(b);
  }
  const wiRow = $("#wi-row");
  if (wiRow) {
    const wiBox = $("#wi-chips");
    wiBox.innerHTML = "";
    const wis = {};
    if (S.subject !== "all")
      for (const q of window.G421.questions)
        if (q.s === S.subject && q.wi) (wis[q.wi] = wis[q.wi] || 0, wis[q.wi]++);
    const keys = Object.keys(wis).sort();
    if (keys.length > 1) {
      const witems = [["", `全部工作項目 <small>${poolOf(S.subject).length}題</small>`],
        ...keys.map(k => [k, `${k.replace("：", " ")} <small>${wis[k]}題</small>`])];
      for (const [k, v] of witems) {
        const b = document.createElement("button");
        b.className = "chip" + (k === (S.wi || "") ? " on" : "");
        b.innerHTML = v;
        b.onclick = () => { S.wi = k || null; S.part = null; renderHome(); snd.tap(); };
        wiBox.appendChild(b);
      }
      wiRow.classList.remove("hidden");
    } else {
      S.wi = null;
      wiRow.classList.add("hidden");
    }
  }
  const partRow = $("#part-row");
  if (partRow) {
    const partBox = $("#part-chips");
    partBox.innerHTML = "";
    const ps = {};
    if (S.wi)
      for (const q of window.G421.questions)
        if (q.s === S.subject && q.wi === S.wi && q.g) (ps[q.g] = ps[q.g] || 0, ps[q.g]++);
    const pkeys = Object.keys(ps).sort();
    if (pkeys.length > 1) {
      const pitems = [["", `全部 <small>${poolOf(S.subject, S.wi).length}題</small>`],
        ...pkeys.map(k => [k, `${k} <small>${ps[k]}題</small>`])];
      for (const [k, v] of pitems) {
        const b = document.createElement("button");
        b.className = "chip" + (k === (S.part || "") ? " on" : "");
        b.innerHTML = v;
        b.onclick = () => { S.part = k || null; renderHome(); snd.tap(); };
        partBox.appendChild(b);
      }
      partRow.classList.remove("hidden");
    } else {
      S.part = null;
      partRow.classList.add("hidden");
    }
  }
  const cnts = $("#cnt-chips"); cnts.innerHTML = "";
  for (const c of [10, 20, 30, 50]) {
    const b = document.createElement("button");
    b.className = "chip" + (c === S.count ? " on" : "");
    b.textContent = c + " 題";
    b.onclick = () => { S.count = c; $$("#cnt-chips .chip").forEach(x => x.classList.toggle("on", x === b)); snd.tap(); };
    cnts.appendChild(b);
  }
  show("#v-home");
}
$$(".mode").forEach(b => b.onclick = () => {
  S.mode = b.dataset.m;
  $$(".mode").forEach(x => x.classList.toggle("on", x === b));
  snd.tap();
});
$("#btn-go").onclick = startRound;

/* ---------- 開機 ---------- */
syncToggles();
$(".mode[data-m=review]").classList.add("on");
const r0 = loadRound();
if (r0 && r0.pos < r0.queue.length) {
  S.round = r0;
  S.round.elapsedBase = r0.elapsedBase || 0;
  show("#v-quiz");
  renderQ();
  toast("已接續你上次的練習 📍");
} else {
  if (r0) { S.round = null; saveRound(); }
  renderHome();
}
