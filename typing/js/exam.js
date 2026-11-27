(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var P = new URLSearchParams(location.search);
  var mode = P.get('mode') === 'exam' ? 'exam' : 'practice';
  var lang = P.get('lang') === 'eng' ? 'eng' : 'chn';
  var test = P.get('test') === '2' ? 2 : 1;
  var isChn = lang === 'chn';

  var ta = $('input'), src = $('source');
  var paper = '', minutes = 10, student = null, target = null, tLines = [];
  var started = false, finished = false, startAt = 0, endAt = 0, tick = null, blurCount = 0;
  var composing = false, liveQueued = false, payload = null;

  document.body.classList.add(mode, lang);

  // 字級（pt），每台電腦記住自己的設定；預設 18pt（約 24px）
  var FS_KEY = 'fontPt-' + lang;
  var fontPt = parseInt(localStorage.getItem(FS_KEY), 10) || 18;
  function applyFont() {
    fontPt = Math.min(36, Math.max(12, fontPt));
    document.body.style.setProperty('--fs', (fontPt * 4 / 3) + 'px');
    $('fsVal').textContent = fontPt;
    localStorage.setItem(FS_KEY, fontPt);
  }
  $('fsDown').onclick = function () { fontPt -= 2; applyFont(); ta.focus(); };
  $('fsUp').onclick = function () { fontPt += 2; applyFont(); ta.focus(); };
  applyFont();
  init().catch(function (e) { fatal(e && e.message ? e.message : String(e)); });

  function fatal(msg) {
    $('rules').innerHTML = '<li class="over-tip">' + App.esc(msg) + '</li>';
    $('startBtn').hidden = true;
  }

  async function init() {
    $('pageTitle').textContent = (isChn ? '中文' : '英文') + '輸入測驗';
    $('modeLabel').textContent = mode === 'exam' ? '教室考試' : '在家練習';
    $('cntLabel').textContent = isChn ? '已輸入字數' : '已輸入擊數';

    if (mode === 'exam') {
      if (!App.isServer) throw new Error('考試模式需要連線到教師電腦。');
      try { student = JSON.parse(sessionStorage.getItem('student') || 'null'); } catch (e) { }
      if (!student) { location.replace('index.html#exam'); return; }
      var r = await fetch('/api/config', { cache: 'no-store' });
      if (!r.ok) throw new Error('無法取得考試設定，請舉手告知老師。');
      var cfg = await r.json();
      paper = isChn ? cfg.chnPaper : cfg.engPaper;
      minutes = App.clampMin(cfg.minutes);
      $('who').textContent = student.cls + '班 ' + student.seat + '號 ' + student.name;
      $('backLink').href = $('homeLink').href = 'index.html#exam';
    } else {
      paper = P.get('paper') || '';
      minutes = App.clampMin(P.get('min'));
      $('who').textContent = '練習模式';
    }

    target = Scorer.buildTarget(App.Q(), paper, test);
    if (!target) throw new Error('題庫中找不到試卷 ' + paper + '-' + test);
    tLines = target.text.split('\n');
    $('paperId').textContent = target.firstId;
    $('testNo').textContent = test === 1 ? '測驗一' : '測驗二';
    $('timer').textContent = App.fmtTime(minutes * 60);
    renderSource();
    renderRules();
    $('startBtn').onclick = begin;
    $('startBtn').focus();
  }

  // 原文與輸入視窗逐行對齊：不插入任何額外的列，接續卷以虛線標示（不佔高度）
  function renderSource() {
    var h = '';
    tLines.forEach(function (l, i) {
      h += '<div class="line' + (i === target.splitAt ? ' part2' : '') + '" data-i="' + i + '"' +
        (i === target.splitAt ? ' title="以下接續 ' + App.esc(target.secondId) + '"' : '') +
        '><span class="tx">' + App.esc(l) + '</span><span class="eol">↵</span></div>';
    });
    src.innerHTML = h;
    $('partLabel').textContent = target.secondId ? '虛線以下接續 ' + target.secondId : '';
  }

  // 兩個視窗同步捲動，讓輸入中的那一行與原文同一行保持在相同高度
  function syncScroll() {
    var lh = parseFloat(getComputedStyle(ta).lineHeight) || 40;
    var cur = ta.value.split('\n').length - 1;
    var top = Math.max(0, Math.round(cur * lh - ta.clientHeight / 3));
    ta.scrollTop = top;
    src.scrollTop = ta.scrollTop;
    src.scrollLeft = ta.scrollLeft;
  }
  ta.addEventListener('scroll', function () { src.scrollTop = ta.scrollTop; src.scrollLeft = ta.scrollLeft; });

  function renderRules() {
    var other = target.secondId || '另一份試卷';
    var rules = [
      '測驗時間 <b>' + minutes + ' 分鐘</b>。' + (isChn ? '按下「開始測驗」後立即開始倒數計時。' : '輸入第一個按鍵時才開始倒數計時。'),
      '請依照上方試卷 <b>' + App.esc(target.firstId) + '</b> 的內容輸入，若時間未到即輸入完畢，請繼續輸入 <b>' + App.esc(other) + '</b>。',
      isChn ? '每段段首請按全形空白 2 格（或半形空白 4 格、或 [Tab] 鍵），每行末尾皆需按 [Enter] 換行。'
            : '每段段首請按空白鍵 5 格（或 [Tab] 鍵），每行末尾皆需按 [Enter] 換行。',
      isChn ? '輸入正確每字計 1 字，輸入錯誤每字倒扣 0.5 字；成績以「平均每分鐘字數」計算。'
            : '輸入每字元計 1 擊，每錯誤一字扣總擊數 20 擊；成績以「每分鐘字數（每 5 擊為 1 字，Word/Min.）」計算。',
      '<span class="over-tip">錯誤率 10%（含）以上者，成績以 0 分計算。</span>',
      '輸入視窗不能貼上文字；時間到會自動交卷。'
    ];
    if (mode === 'exam') {
      rules.push('交卷後成績會自動傳送到教師電腦，請勿關閉視窗，並聽候老師指示。');
      rules.push('測驗中請勿切換到其他視窗，系統會記錄離開次數。');
    }
    $('ruleTitle').textContent = (isChn ? '中文' : '英文') + '輸入' + (mode === 'exam' ? '測驗' : '練習') + '說明';
    $('rules').innerHTML = rules.map(function (r) { return '<li>' + r + '</li>'; }).join('');
  }

  function begin() {
    $('startOverlay').hidden = true;
    ta.disabled = false;
    ta.focus();
    $('submitBtn').disabled = false;
    if (isChn) startTimer();
    else { $('timerBox').classList.add('waiting'); $('timer').textContent = '按鍵後開始 ' + App.fmtTime(minutes * 60); }
    window.onbeforeunload = function () { return '測驗尚未結束，確定要離開嗎？'; };
    live();
  }

  function startTimer() {
    if (started || finished) return;
    started = true;
    startAt = Date.now();
    endAt = startAt + minutes * 60000;
    $('timerBox').classList.remove('waiting');
    tick = setInterval(updateTimer, 200);
    updateTimer();
  }

  function updateTimer() {
    var left = (endAt - Date.now()) / 1000;
    $('timer').textContent = App.fmtTime(left);
    $('timerBox').classList.toggle('warn', left <= 60);
    if (left <= 0) finish('time');
  }

  // ── 輸入處理 ──
  ta.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      // Tab 鍵當作段首縮排輸入（不切換焦點）
      e.preventDefault();
      if (ta.readOnly || ta.disabled) return;
      if (!isChn && !started) startTimer();
      if (!document.execCommand('insertText', false, '\t')) {
        ta.setRangeText('\t', ta.selectionStart, ta.selectionEnd, 'end');
        queueLive();
      }
      return;
    }
    if (!isChn && !started && !e.ctrlKey && !e.altKey && (e.key.length === 1 || e.key === 'Enter')) startTimer();
  });
  ta.addEventListener('input', function () {
    if (!isChn && !started) startTimer();
    if (!composing) queueLive();
  });
  ta.addEventListener('compositionstart', function () { composing = true; });
  ta.addEventListener('compositionend', function () { composing = false; queueLive(); });
  ['paste', 'drop', 'cut', 'contextmenu'].forEach(function (ev) {
    ta.addEventListener(ev, function (e) { e.preventDefault(); });
  });
  window.addEventListener('blur', function () {
    if (mode !== 'exam' || finished || ta.disabled) return;
    blurCount++;
    toast('請勿離開測驗視窗！（已記錄 ' + blurCount + ' 次）');
  });

  function queueLive() {
    if (liveQueued) return;
    liveQueued = true;
    requestAnimationFrame(function () { liveQueued = false; live(); });
  }

  function live() {
    var v = ta.value;
    var curLine = v.split('\n').length - 1;
    $('cnt').textContent = isChn ? v.replace(/\n/g, '').length : v.length;
    $('lineLabel').textContent = '第 ' + (curLine + 1) + ' 行';
    var cur = src.querySelector('.line.cur');
    if (cur) cur.classList.remove('cur');
    var el = src.querySelector('.line[data-i="' + curLine + '"]');
    if (el) el.classList.add('cur');
    syncScroll();
    if (mode === 'practice') {
      var r = Scorer.score({ lang: lang, target: target.text, typed: v, seconds: 1 });
      $('errs').textContent = r.errors;
      var lines = src.querySelectorAll('.line');
      for (var i = 0; i < lines.length; i++) {
        var info = r.lines[i];
        lines[i].classList.toggle('ok', !!(info && info.done && !info.errors));
        lines[i].classList.toggle('bad', !!(info && info.errors));
      }
    }
  }

  $('submitBtn').onclick = function () {
    if (confirm('確定要交卷嗎？交卷後就不能再修改。')) finish('submit');
  };

  // ── 結束、計分、傳送 ──
  function finish(reason) {
    if (finished) return;
    finished = true;
    clearInterval(tick);
    ta.readOnly = true;
    ta.blur();
    $('submitBtn').disabled = true;
    window.onbeforeunload = null;
    if (reason === 'time') $('timer').textContent = '0:00';
    var seconds = started ? Math.min(minutes * 60, (Date.now() - startAt) / 1000) : 0;
    var r = Scorer.score({ lang: lang, target: target.text, typed: ta.value, seconds: seconds });
    showResult(r, seconds);

    if (mode === 'practice') {
      var hist = [];
      try { hist = JSON.parse(localStorage.getItem('practiceHistory') || '[]'); } catch (e) { }
      hist.unshift({ time: new Date().toLocaleString('zh-TW', { hour12: false }), lang: lang, paper: paper, test: test,
        seconds: Math.round(seconds), errRate: r.errRate, score: r.score, perMin: r.perMin, over: r.over });
      localStorage.setItem('practiceHistory', JSON.stringify(hist.slice(0, 50)));
    } else {
      payload = {
        cls: student.cls, seat: student.seat, name: student.name,
        lang: lang, paper: paper, test: test, minutes: minutes, seconds: Math.round(seconds),
        text: ta.value, correct: r.correct, errors: r.errors, total: r.total, errRate: r.errRate,
        net: r.net, score: r.score, perMin: r.perMin, rawPerMin: r.rawPerMin, over: r.over,
        blurCount: blurCount, finishedBy: reason, clientTime: new Date().toISOString()
      };
      send(3);
    }
  }

  function showResult(r, seconds) {
    var cls = r.over ? ' class="over"' : '';
    var rows = isChn ? [
      ['輸入字數', r.total], ['正確字數', r.correct], ['錯誤字數', r.errors],
      ['錯誤率', '<span' + cls + '>' + App.pct(r.errRate) + '</span>'],
      ['淨字數（正確 − 錯誤 × 0.5）', App.num(r.net)]
    ] : [
      ['總擊數', r.hits], ['輸入單字數', r.words], ['錯誤字數', r.errors],
      ['錯誤率', '<span' + cls + '>' + App.pct(r.errRate) + '</span>'],
      ['淨擊數（總擊數 − 錯誤 × 20）', App.num(r.net)]
    ];
    rows.push(['測驗時間', App.fmtTime(seconds)]);
    var h = rows.map(function (x) { return '<tr><td>' + x[0] + '</td><td>' + x[1] + '</td></tr>'; }).join('');
    h += '<tr class="big"><td>成績（平均' + (isChn ? '字數' : '速度') + '）</td><td' + cls + '>每分鐘 ' + App.num(r.score) +
      (isChn ? ' 字' : ' Word/Min.') + '</td></tr>';
    if (r.over) h += '<tr><td class="muted">未扣除錯誤率前</td><td class="muted">每分鐘 ' + App.num(r.rawPerMin) + (isChn ? ' 字' : ' Word/Min.') + '（僅供參考）</td></tr>';
    $('resultTable').innerHTML = h;
    $('overTip').hidden = !r.over;
    // 錯誤率 10%（含）以上：整頁字體改為紅字
    document.body.classList.toggle('over-page', r.over);
    $('resultOverlay').hidden = false;
  }

  async function send(retries) {
    var st = $('sendStatus');
    st.className = ''; st.textContent = '成績傳送中…';
    $('resendBtn').hidden = true;
    for (var i = 0; i < retries; i++) {
      try {
        var r = await fetch('/api/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (r.ok) {
          st.className = 'send-ok'; st.textContent = '✔ 成績已傳送到教師電腦';
          localStorage.removeItem('pendingScore');
          return;
        }
      } catch (e) { }
      await new Promise(function (res) { setTimeout(res, 2000); });
    }
    localStorage.setItem('pendingScore', JSON.stringify(payload));
    st.className = 'send-fail'; st.textContent = '✘ 成績傳送失敗，請舉手告知老師，並按下「重新傳送成績」。';
    $('resendBtn').hidden = false;
  }
  $('resendBtn').onclick = function () { send(1); };

  var toastTimer;
  function toast(msg) {
    var t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 3000);
  }
})();
