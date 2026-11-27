/* 計分核心：練習、考試、教師端重新計算共用（比照原系統 ChnToScore / EngToScore）
 *
 * 比對方式：逐行比對（每行結尾須按 Enter），同一行內以編輯距離對齊，
 *   打錯、多打、漏打各算一個錯誤；最後一行（尚未按 Enter）只比到已輸入的部分。
 *   中文以「字」為單位比對；英文以「單字（word）」為單位比對。
 *
 * 中文：正確每字計 1 字，錯誤每字倒扣 0.5 字。
 *        淨字數 = 正確字數 − 錯誤字數 × 0.5
 *        成績（平均字數）= 淨字數 ÷ 測驗分鐘數　→　字/分鐘
 * 英文：輸入每字元（含空白、Enter）計 1 擊，每錯誤一次扣 20 擊。
 *        淨擊數 = 總擊數 − 錯誤次數 × 20
 *        成績 = 淨擊數 ÷ 5 ÷ 測驗分鐘數　→　Word/Min（每 5 擊為 1 字）
 * 段首縮排：中文按全形空白 2 格、半形空白 4 格或 Tab 鍵；英文按空白 5 格或 Tab 鍵，都算正確。
 *   （計分時統一換算成標準縮排，按 Tab 與按空白的字數／擊數相同，不會吃虧。）
 * 錯誤率 = 錯誤數 ÷ 輸入數（中文：字；英文：單字）
 * 錯誤率 10%（含）以上：成績以 0 分計，顯示紅字並提示。
 */
(function (g) {
  'use strict';
  var ERROR_LIMIT = 0.10;
  var STROKES_PER_WORD = 5;

  // 以編輯距離對齊兩個序列（字元陣列或單字陣列）。
  // partial=true 時，原文後段尚未輸入的部分不計錯。
  function align(s, t, partial) {
    var n = s.length, m = t.length, i, j;
    var pc = new Int32Array(m + 1), pm = new Int32Array(m + 1);
    for (j = 0; j <= m; j++) { pc[j] = j; pm[j] = 0; }
    for (i = 1; i <= n; i++) {
      var cc = new Int32Array(m + 1), cm = new Int32Array(m + 1);
      cc[0] = i; cm[0] = 0;
      var si = s[i - 1];
      for (j = 1; j <= m; j++) {
        var same = si === t[j - 1];
        var bc = pc[j - 1] + (same ? 0 : 1), bm = pm[j - 1] + (same ? 1 : 0);
        var c2 = pc[j] + 1, m2 = pm[j];           // 多打
        if (c2 < bc || (c2 === bc && m2 > bm)) { bc = c2; bm = m2; }
        var c3 = cc[j - 1] + 1, m3 = cm[j - 1];   // 漏打
        if (c3 < bc || (c3 === bc && m3 > bm)) { bc = c3; bm = m3; }
        cc[j] = bc; cm[j] = bm;
      }
      pc = cc; pm = cm;
    }
    if (!partial) return { errors: pc[m], correct: pm[m] };
    var be = pc[0], bmm = pm[0];
    for (j = 1; j <= m; j++) if (pc[j] < be || (pc[j] === be && pm[j] > bmm)) { be = pc[j]; bmm = pm[j]; }
    return { errors: be, correct: bmm };
  }

  // 段首縮排的等效寫法，一律視為正確：
  //   中文：全形空白 2 格 ＝ 半形空白 4 格 ＝ Tab 鍵
  //   英文：半形空白 5 格 ＝ Tab 鍵
  var CHN_INDENT = '　　', ENG_INDENT = '     ';
  function normalizeIndent(text, isChn) {
    return String(text).split('\n').map(function (l) {
      return isChn ? l.replace(/^(\t|    |　　)/, CHN_INDENT)
                   : l.replace(/^(\t|     )/, ENG_INDENT);
    }).join('\n');
  }

  function words(line) { var w = line.split(/ +/); return w.filter(function (x) { return x !== ''; }); }

  // 測驗一：-1 接 -2；測驗二：-2 接 -1
  function buildTarget(Q, paper, test) {
    var a = Q[paper + '-' + test], b = Q[paper + '-' + (test === 2 ? 1 : 2)];
    if (!a) return null;
    return {
      text: b ? a + '\n' + b : a,
      splitAt: b ? a.split('\n').length : -1,
      firstId: paper + '-' + test,
      secondId: b ? paper + '-' + (test === 2 ? 1 : 2) : ''
    };
  }

  function score(o) {
    var isChn = o.lang !== 'eng';
    var tLines = String(o.target || '').split('\n');
    var typed = normalizeIndent(String(o.typed || '').replace(/\r\n?/g, '\n'), isChn);
    var sLines = typed.split('\n');
    var correct = 0, errors = 0, units = 0, lines = [];
    for (var k = 0; k < sLines.length; k++) {
      var done = k < sLines.length - 1;
      var t = k < tLines.length ? tLines[k] : '';
      var sl = sLines[k];
      var r;
      if (!done && sl === '') r = { errors: 0, correct: 0 };
      else if (isChn) r = align(Array.from(sl), Array.from(t), !done);
      else {
        // 英文：段首空白屬於格式，不計單字；以單字比對，最後一個未打完的單字不計
        var sw = words(sl), tw = words(t);
        if (!done && sl.length && sl.charAt(sl.length - 1) !== ' ' && sw.length) {
          var last = sw[sw.length - 1], idx = sw.length - 1;
          // 正在輸入中的單字：若是原文對應單字的開頭就先不計
          if (idx < tw.length && tw[idx].indexOf(last) === 0) sw = sw.slice(0, -1);
        }
        r = align(sw, tw, !done);
        units += sw.length;
        // 段首縮排檢查：原文有縮排卻沒打（或空白數不對）、原文沒縮排卻多打，各算 1 個錯誤
        if (sw.length) {
          var tIndent = /^ /.test(t) ? t.match(/^ +/)[0] : '';
          var sIndent = /^ /.test(sl) ? sl.match(/^ +/)[0] : '';
          if (tIndent !== sIndent) { r = { errors: r.errors + 1, correct: r.correct }; units += 1; }
        }
      }
      if (isChn) units += Array.from(sl).length;
      correct += r.correct; errors += r.errors;
      lines.push({ errors: r.errors, correct: r.correct, done: done });
    }
    var seconds = Math.max(1, +o.seconds || 0);
    var minutes = seconds / 60;
    var res = { lang: isChn ? 'chn' : 'eng', correct: correct, errors: errors, seconds: Math.round(seconds), lines: lines };
    res.units = units;
    res.errRate = units ? Math.min(1, errors / units) : 0;
    if (isChn) {
      res.total = units;                                  // 輸入字數
      res.net = correct - errors * 0.5;                   // 淨字數
      res.rawPerMin = res.net / minutes;                  // 平均字數（字/分鐘）
    } else {
      res.hits = typed.length;                            // 總擊數（含空白、Enter）
      res.total = res.hits;
      res.words = units;
      res.net = res.hits - errors * 20;                   // 淨擊數
      res.rawPerMin = res.net / STROKES_PER_WORD / minutes; // Word/Min
    }
    res.rawPerMin = Math.max(0, Math.round(res.rawPerMin * 10) / 10);
    res.over = res.errRate >= ERROR_LIMIT && errors > 0;
    res.score = res.over ? 0 : res.rawPerMin;             // 成績 = 每分鐘字數
    res.perMin = res.score;
    return res;
  }

  g.Scorer = { score: score, buildTarget: buildTarget, align: align, normalizeIndent: normalizeIndent, ERROR_LIMIT: ERROR_LIMIT };
})(typeof window !== 'undefined' ? window : this);
