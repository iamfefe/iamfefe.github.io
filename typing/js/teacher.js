(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var records = [], rows = [], timer = null;
  var OVER_NOTE = '錯誤率超過10%，成績歸零請注意。';

  $('date').value = App.today();
  $('cfgMin').innerHTML = App.minuteOptions(10);

  // ── 連線資訊 ──
  fetch('/api/info').then(function (r) { return r.json(); }).then(function (info) {
    $('addrs').innerHTML = info.ips.length
      ? info.ips.map(function (ip) { return '<code class="addr">http://' + ip + ':' + info.port + '/</code>'; }).join(' ')
      : '<span class="over-tip">找不到區域網路 IP，請確認網路已連線。</span>';
  });

  // ── 考試設定 ──
  function fillPapers(sel, lang, val) {
    var list = App.papers(lang);
    sel.innerHTML = list.length ? list.map(function (p) {
      return '<option' + (p === val ? ' selected' : '') + '>' + App.esc(p) + '</option>';
    }).join('') : '<option value="">（沒有試卷）</option>';
  }
  function loadCfg() {
    return fetch('/api/config', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (c) {
      fillPapers($('cfgChn'), 'chn', c.chnPaper);
      fillPapers($('cfgEng'), 'eng', c.engPaper);
      $('cfgMin').value = c.minutes;
    });
  }
  loadCfg();
  $('saveCfg').onclick = function () {
    fetch('/api/config', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chnPaper: $('cfgChn').value, engPaper: $('cfgEng').value, minutes: +$('cfgMin').value })
    }).then(function (r) { return r.json(); }).then(function () {
      $('cfgMsg').textContent = '✔ 已儲存（' + new Date().toLocaleTimeString('zh-TW', { hour12: false }) + '）';
    });
  };
  $('reloadQ').onclick = function () {
    fetch('/api/reload', { method: 'POST' }).then(function (r) { return r.json(); }).then(function (r) {
      alert('已重新讀取題庫，共 ' + r.count + ' 個檔案。頁面將重新整理。');
      location.reload();
    });
  };

  // ── 成績 ──
  function load() {
    fetch('/api/scores?date=' + encodeURIComponent($('date').value), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (list) { records = list.map(recompute); fillClasses(); render(); })
      .catch(function () { $('scores').innerHTML = '<tr><td class="over-tip">無法讀取成績</td></tr>'; });
  }

  // 依題庫重新計算，避免學生端資料被竄改
  function recompute(s) {
    var test = +s.test === 2 ? 2 : 1;
    var t = Scorer.buildTarget(App.Q(), s.paper, test);
    var x = {
      time: (s.receivedAt || '').slice(11), cls: s.cls || '', seat: s.seat || '', name: s.name || '',
      lang: s.lang === 'eng' ? 'eng' : 'chn', paper: s.paper || '', test: test, seconds: +s.seconds || 0,
      blur: +s.blurCount || 0, text: s.text || '', ip: s.ip || '', mismatch: false
    };
    var r = t ? Scorer.score({ lang: x.lang, target: t.text, typed: x.text, seconds: x.seconds }) : null;
    if (r) {
      x.correct = r.correct; x.errors = r.errors; x.total = r.total; x.errRate = r.errRate;
      x.net = r.net; x.score = r.score; x.perMin = r.perMin; x.over = r.over; x.raw = r.rawPerMin;
      x.mismatch = Math.abs((+s.score || 0) - r.score) > 0.01;
    } else {
      x.correct = +s.correct || 0; x.errors = +s.errors || 0; x.total = +s.total || 0; x.errRate = +s.errRate || 0;
      x.net = +s.net || 0; x.score = +s.score || 0; x.perMin = +s.perMin || 0; x.over = !!s.over; x.raw = +s.rawPerMin || 0;
    }
    return x;
  }

  function fillClasses() {
    var sel = $('fCls'), cur = sel.value, set = {};
    records.forEach(function (r) { set[r.cls] = 1; });
    sel.innerHTML = '<option value="">全部</option>' + Object.keys(set).sort().map(function (c) {
      return '<option' + (c === cur ? ' selected' : '') + '>' + App.esc(c) + '</option>';
    }).join('');
  }

  function bySeat(a, b) {
    return String(a.cls).localeCompare(String(b.cls), 'zh-Hant', { numeric: true }) ||
      (parseInt(a.seat, 10) || 0) - (parseInt(b.seat, 10) || 0) || a.lang.localeCompare(b.lang);
  }

  function unit(lang) { return lang === 'eng' ? ' WPM' : ' 字/分'; }
  function scoreCell(r) {
    if (!r) return '<td class="muted">—</td>';
    return r.over
      ? '<td class="over" title="未扣除前：每分鐘 ' + App.num(r.raw) + unit(r.lang) + '（僅供參考）">0　' + OVER_NOTE + '</td>'
      : '<td>' + App.num(r.score) + unit(r.lang) + (r.mismatch ? ' <span class="over-tip" title="學生端送出的成績與重新計算不符，已以重新計算為準">⚠</span>' : '') + '</td>';
  }

  function render() {
    var f = records.filter(function (r) {
      return (!$('fLang').value || r.lang === $('fLang').value) && (!$('fCls').value || r.cls === $('fCls').value);
    });
    var people = {};
    f.forEach(function (r) { people[r.cls + '|' + r.seat + '|' + r.name] = 1; });
    $('sumText').textContent = '（' + $('date').value + '：' + f.length + ' 筆紀錄，' + Object.keys(people).length + ' 位考生）';

    var h;
    if ($('view').value === 'all') {
      rows = f.slice().sort(function (a, b) { return b.time.localeCompare(a.time); });
      h = '<tr><th>交卷時間</th><th>班級</th><th>座號</th><th>姓名</th><th>科目</th><th>試卷</th><th>測驗</th>' +
        '<th>正確</th><th>錯誤</th><th>錯誤率</th><th>淨字(擊)數</th><th>成績（每分鐘）</th><th>測驗時間</th><th>離開視窗</th><th>內容</th></tr>';
      h += rows.map(function (r, i) {
        var oc = r.over ? ' class="over"' : '';
        return '<tr' + (r.over ? ' class="over-row"' : '') + '><td>' + r.time + '</td><td>' + App.esc(r.cls) + '</td><td>' + App.esc(r.seat) + '</td><td>' + App.esc(r.name) +
          '</td><td>' + App.langName[r.lang] + '</td><td>' + App.esc(r.paper) + '</td><td>' + (r.test === 1 ? '一' : '二') +
          '</td><td>' + r.correct + '</td><td>' + r.errors + '</td><td' + oc + '>' + App.pct(r.errRate) + '</td><td>' + App.num(r.net) +
          '</td>' + scoreCell(r) + '<td>' + App.fmtTime(r.seconds) +
          '</td><td' + (r.blur ? ' class="over"' : '') + '>' + r.blur + '</td><td><button class="btn ghost small" data-i="' + i + '">檢視</button></td></tr>';
      }).join('');
    } else {
      var g = {};
      f.forEach(function (r) {
        var k = r.cls + '|' + r.seat + '|' + r.name + '|' + r.lang;
        var e = g[k] || (g[k] = { cls: r.cls, seat: r.seat, name: r.name, lang: r.lang, t1: null, t2: null });
        var slot = r.test === 2 ? 't2' : 't1';
        if (!e[slot] || r.score > e[slot].score) e[slot] = r;
      });
      rows = Object.keys(g).map(function (k) {
        var e = g[k];
        e.best = [e.t1, e.t2].filter(Boolean).sort(function (a, b) { return b.score - a.score; })[0];
        return e;
      }).sort(bySeat);
      h = '<tr><th>班級</th><th>座號</th><th>姓名</th><th>科目</th><th>測驗一</th><th>測驗二</th><th>覆核成績（取高者）</th><th>錯誤率</th></tr>';
      h += rows.map(function (e) {
        var b = e.best, oc = b.over ? ' class="over"' : '';
        return '<tr' + (b.over ? ' class="over-row"' : '') + '><td>' + App.esc(e.cls) + '</td><td>' + App.esc(e.seat) + '</td><td>' + App.esc(e.name) + '</td><td>' +
          App.langName[e.lang] + '</td>' + scoreCell(e.t1) + scoreCell(e.t2) + scoreCell(b).replace('<td', '<td style="font-weight:900;font-size:17px"') +
          '<td' + oc + '>' + App.pct(b.errRate) + '</td></tr>';
      }).join('');
    }
    if (!f.length) h += '<tr><td colspan="16" class="muted" style="padding:20px">今天還沒有成績</td></tr>';
    $('scores').innerHTML = h;
  }

  $('scores').onclick = function (e) {
    var b = e.target.closest('button[data-i]');
    if (!b) return;
    var r = rows[+b.dataset.i];
    $('textTitle').textContent = r.cls + '班 ' + r.seat + '號 ' + r.name + '　' + App.langName[r.lang] + ' ' + r.paper + '-' + r.test;
    $('textBody').textContent = r.text || '（沒有輸入內容）';
    $('textDlg').hidden = false;
  };
  $('textClose').onclick = function () { $('textDlg').hidden = true; };

  // ── 匯出 CSV（Excel 可直接開啟） ──
  $('csv').onclick = function () {
    var out = [];
    function q(v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
    if ($('view').value === 'all') {
      out.push(['交卷時間', '班級', '座號', '姓名', '科目', '試卷', '測驗', '正確', '錯誤', '錯誤率', '淨字(擊)數', '成績(每分鐘)', '單位', '測驗秒數', '離開視窗', '備註']);
      rows.forEach(function (r) {
        out.push([r.time, r.cls, r.seat, r.name, App.langName[r.lang], r.paper, r.test, r.correct, r.errors, App.pct(r.errRate),
          App.num(r.net), App.num(r.score), r.lang === 'eng' ? 'Word/Min' : '字/分鐘', r.seconds, r.blur, r.over ? OVER_NOTE : '']);
      });
    } else {
      out.push(['班級', '座號', '姓名', '科目', '測驗一', '測驗二', '覆核成績', '單位', '錯誤率', '備註']);
      rows.forEach(function (e) {
        out.push([e.cls, e.seat, e.name, App.langName[e.lang], e.t1 ? App.num(e.t1.score) : '', e.t2 ? App.num(e.t2.score) : '',
          App.num(e.best.score), e.lang === 'eng' ? 'Word/Min' : '字/分鐘', App.pct(e.best.errRate), e.best.over ? OVER_NOTE : '']);
      });
    }
    var csv = '﻿' + out.map(function (r) { return r.map(q).join(','); }).join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = '輸入測驗成績_' + $('date').value + '.csv';
    a.click();
  };

  ['date', 'fLang', 'fCls', 'view'].forEach(function (id) { $(id).onchange = id === 'date' ? load : render; });
  $('refresh').onclick = load;
  function setAuto() {
    clearInterval(timer);
    if ($('auto').checked) timer = setInterval(load, 5000);
  }
  $('auto').onchange = setAuto;
  load();
  setAuto();
})();
