(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ── 分頁 ──
  function showTab(t) {
    $$('.tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === t); });
    $$('.panel').forEach(function (p) { p.classList.toggle('on', p.id === t); });
    history.replaceState(null, '', '#' + t);
  }
  $$('.tabs button').forEach(function (b) { b.onclick = function () { showTab(b.dataset.tab); }; });
  showTab(location.hash === '#exam' ? 'exam' : 'practice');

  // ── 在家練習 ──
  $$('#practice .card').forEach(function (card) {
    var lang = card.dataset.lang, sel = $('.paper', card), min = $('.min', card);
    var papers = App.papers(lang);
    sel.innerHTML = papers.length
      ? papers.map(function (p) { return '<option>' + App.esc(p) + '</option>'; }).join('')
      : '<option value="">（題庫中沒有試卷）</option>';
    min.innerHTML = App.minuteOptions(10);
    $('.go', card).onclick = function () {
      if (!sel.value) return alert('題庫中沒有可用的試卷，請確認 questions 資料夾。');
      location.href = 'exam.html?mode=practice&lang=' + lang + '&paper=' + encodeURIComponent(sel.value) +
        '&test=' + $('.test', card).value + '&min=' + min.value;
    };
  });

  // 練習紀錄（只存在本機瀏覽器）
  var hist = [];
  try { hist = JSON.parse(localStorage.getItem('practiceHistory') || '[]'); } catch (e) { }
  if (hist.length) {
    $('#historyBox').hidden = false;
    $('#history').innerHTML = '<tr><th>日期時間</th><th>科目</th><th>試卷</th><th>時間</th><th>錯誤率</th><th>成績（每分鐘）</th></tr>' +
      hist.slice(0, 20).map(function (h) {
        return '<tr' + (h.over ? ' class="over-row"' : '') + '><td>' + App.esc(h.time) + '</td><td>' + App.langName[h.lang] + '</td><td>' + App.esc(h.paper) + '-' + h.test +
          '</td><td>' + App.fmtTime(h.seconds) + '</td><td' + (h.over ? ' class="over"' : '') + '>' + App.pct(h.errRate) +
          '</td><td' + (h.over ? ' class="over"' : '') + '>' + App.num(h.score) + (h.lang === 'eng' ? ' WPM' : ' 字/分') +
          (h.over ? '　錯誤率超過10%，成績歸零請注意。' : '') + '</td></tr>';
      }).join('');
  }

  // ── 教室考試 ──
  if (!App.isServer) {
    $('#examOffline').hidden = false;
    return;
  }
  var student = null;
  try { student = JSON.parse(sessionStorage.getItem('student') || 'null'); } catch (e) { }

  var form = $('#examLogin');
  form.onsubmit = function (e) {
    e.preventDefault();
    student = { cls: form.cls.value.trim(), seat: form.seat.value.trim(), name: form.name.value.trim() };
    if (!student.cls || !student.seat || !student.name) return;
    sessionStorage.setItem('student', JSON.stringify(student));
    showChoose();
  };
  $('#logout').onclick = function () {
    sessionStorage.removeItem('student'); student = null;
    $('#examChoose').hidden = true; form.hidden = false; form.reset();
  };

  function showChoose() {
    form.hidden = true;
    $('#examChoose').hidden = false;
    $('#whoText').textContent = student.cls + ' 班　' + student.seat + ' 號　' + student.name;
    fetch('/api/config', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (cfg) {
      $$('#examChoose .card').forEach(function (card) {
        var lang = card.dataset.lang, paper = lang === 'chn' ? cfg.chnPaper : cfg.engPaper;
        $('.paperId', card).textContent = paper || '（老師尚未設定）';
        $('.mins', card).textContent = App.clampMin(cfg.minutes);
        $$('button[data-test]', card).forEach(function (b) {
          b.disabled = !paper;
          b.onclick = function () { location.href = 'exam.html?mode=exam&lang=' + lang + '&test=' + b.dataset.test; };
        });
      });
    }).catch(function () { alert('無法取得考試設定，請確認教師電腦的伺服器已開啟。'); });
  }

  if (student) showChoose(); else form.hidden = false;
})();
