(function (g) {
  'use strict';
  var App = {
    title: '中英文輸入練習暨測驗系統',
    isServer: /^https?:$/.test(location.protocol),
    langName: { chn: '中文', eng: '英文' },
    Q: function () { return g.QUESTIONS || {}; },
    papers: function (lang) {
      var pre = lang === 'eng' ? 'ENG-' : 'CHN-', set = {};
      Object.keys(App.Q()).forEach(function (k) {
        if (k.indexOf(pre) === 0 && /-[12]$/.test(k)) set[k.slice(0, -2)] = 1;
      });
      return Object.keys(set).sort();
    },
    clampMin: function (v) { v = parseInt(v, 10); return v >= 1 && v <= 10 ? v : 10; },
    minuteOptions: function (sel) {
      var h = '';
      for (var i = 1; i <= 10; i++) h += '<option value="' + i + '"' + (i === sel ? ' selected' : '') + '>' + i + ' 分鐘</option>';
      return h;
    },
    fmtTime: function (sec) {
      sec = Math.max(0, Math.ceil(sec));
      return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
    },
    pct: function (r) { return (Math.round(r * 1000) / 10).toFixed(1) + '%'; },
    num: function (n) { return (Math.round(n * 10) / 10).toString(); },
    esc: function (s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    },
    today: function () {
      var d = new Date();
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
  };
  g.App = App;
})(window);
