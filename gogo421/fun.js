/* GoGo421 搞怪版加料：背景飄塊、跟隨幽靈、+1粒子、怪獸彩蛋、蓋印章、逃跑掃帚、8-bit 音效 */
(() => {
  const $ = s => document.querySelector(s);
  const reduced = () => document.body.classList.contains("no-motion");

  /* ---- 背景飄動像素怪 ---- */
  const EMO = ["👾", "🚀", "🍄", "⭐", "🕹", "👻", "🧩", "🎮"];
  const fx = $("#fx-bg");
  for (let i = 0; i < 12; i++) {
    const s = document.createElement("span");
    s.className = "fx";
    s.textContent = EMO[i % EMO.length];
    s.style.left = Math.random() * 96 + "vw";
    s.style.top = (60 + Math.random() * 60) + "vh";
    s.style.fontSize = (18 + Math.random() * 22) + "px";
    s.style.animationDuration = (14 + Math.random() * 16) + "s";
    s.style.animationDelay = -Math.random() * 20 + "s";
    s.dataset.depth = (4 + Math.random() * 10).toFixed(1);
    fx.appendChild(s);
  }
  document.addEventListener("mousemove", ev => {
    if (reduced()) return;
    const mx = ev.clientX / innerWidth - .5, my = ev.clientY / innerHeight - .5;
    for (const s of fx.children) {
      const d = +s.dataset.depth;
      s.style.marginLeft = -mx * d + "px";
    }
  }, { passive: true });

  /* ---- 主卡片：幽靈游標 + +1 粒子 ---- */
  const ghost = document.createElement("div");
  ghost.id = "ghost-cur"; ghost.textContent = "👻";
  document.body.appendChild(ghost);
  let lastSpark = 0;
  document.addEventListener("mousemove", ev => {
    if (reduced()) { ghost.style.opacity = 0; return; }
    const hero = $("#hero");
    if (!hero || !$("#v-home").classList.contains("on")) { ghost.style.opacity = 0; return; }
    const r = hero.getBoundingClientRect();
    const inHero = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
    if (!inHero) { ghost.style.opacity = 0; return; }
    ghost.style.opacity = 1;
    ghost.style.left = ev.clientX + 14 + "px";
    ghost.style.top = ev.clientY - 6 + "px";
    const now = Date.now();
    if (now - lastSpark > 130) {
      lastSpark = now;
      const p = document.createElement("span");
      p.className = "spark";
      p.textContent = Math.random() < .5 ? "⭐" : "+1分";
      p.style.left = ev.clientX + "px"; p.style.top = ev.clientY + "px";
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 950);
    }
  }, { passive: true });

  /* ---- 50 題 → 怪獸驚醒冒冷汗 ---- */
  const mon = $("#monster");
  document.addEventListener("click", ev => {
    const chip = ev.target.closest("#cnt-chips .chip");
    if (!chip || !mon) return;
    const n = parseInt(chip.textContent, 10);
    if (n === 50) { mon.textContent = "😱💦"; mon.classList.add("alert"); mon.title = "50 題？！我睡不着了啦！"; }
    else { mon.textContent = "😴💤"; mon.classList.remove("alert"); mon.title = "打瞌睡中…你選 50 題試試"; }
  });

  /* ---- 選中 chip 重播蓋印章動畫 ---- */
  document.addEventListener("click", ev => {
    const chip = ev.target.closest("#subj-chips .chip, #cnt-chips .chip");
    if (!chip || !chip.classList.contains("on")) return;
    chip.style.animation = "none"; void chip.offsetWidth; chip.style.animation = "";
  });

  /* ---- 清空按鈕：掃帚驚恐逃跑 ---- */
  const clr = $("#btn-clear");
  if (clr) {
    const broom = clr.querySelector(".broom");
    clr.addEventListener("mouseenter", () => { broom.textContent = "😱"; });
    clr.addEventListener("mouseleave", () => { broom.textContent = "🧹"; });
  }

  /* ---- 8-bit 街機嗶嗶 ---- */
  let AC;
  document.addEventListener("pointerdown", ev => {
    const b = ev.target.closest("button");
    if (!b || localStorage.getItem("g421sound") === "0") return;
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t = AC.currentTime;
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(b.id === "btn-go" ? 988 : 659, t);
    o.frequency.exponentialRampToValueAtTime(b.id === "btn-go" ? 1976 : 880, t + .06);
    g.gain.setValueAtTime(.06, t);
    g.gain.exponentialRampToValueAtTime(.001, t + .09);
    o.connect(g).connect(AC.destination);
    o.start(t); o.stop(t + .1);
  }, { passive: true });
})();
