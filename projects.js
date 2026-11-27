// ============================================================
//  Fefe 教學網站｜教材清單
//  新增教材：在 PROJECTS 裡加一筆即可，首頁會自動顯示。
//  - cat     ：分類代碼（見 CATEGORIES 的 id）
//  - url     ：本機相對路徑，或外部完整網址（https://...）
//  - featured：true 會出現在首頁「精選」區
//  - frame   ：false = 這個網站不允許嵌入（例如 Canva），點了直接開新分頁
//  - date    ：顯示用日期（YYYY-MM-DD），精選與列表依此排序
// ============================================================

window.CATEGORIES = [
  { id: "cert",  char: "檢", en: "CERTIFY",   name: "檢定類", desc: "丙級術科、學科刷題，證照一次拿。", color: "#f36fa8", icon: "badge" },
  { id: "dt",    char: "概", en: "DIGITAL",   name: "數概",   desc: "數位科技概論的複習站與練習。",     color: "#ffc533", icon: "chip" },
  { id: "da",    char: "應", en: "APPLY",     name: "數應",   desc: "Office、簡報、AI 工具的實作應用。", color: "#ff7a3d", icon: "window" },
  { id: "mm",    char: "媒", en: "MEDIA",     name: "多媒體", desc: "攝影、影像與視覺創作的互動教室。", color: "#2f8cf0", icon: "camera" },
  { id: "web",   char: "網", en: "WEB",       name: "網頁",   desc: "網頁設計課的範例與練習。",         color: "#3fb36b", icon: "code" },
  { id: "type",  char: "打", en: "TYPING",    name: "打字",   desc: "中英文輸入練習與測驗系統。",       color: "#8b6cf0", icon: "keyboard" },
  { id: "path",  char: "升", en: "FUTURE",    name: "升學",   desc: "設計群升學地圖、統測選採與指引。", color: "#e8453c", icon: "cap" },
  { id: "tool",  char: "工", en: "TOOLS",     name: "工具",   desc: "上課好用的小工具與資源。",         color: "#20b2aa", icon: "wrench" },
  { id: "misc",  char: "他", en: "OTHERS",    name: "其他",   desc: "專題、遊戲，還有各種實驗。",       color: "#d9d2c5", icon: "dice" }
];

window.PROJECTS = [
  // ---- 檢定類 ----
  { cat: "cert", title: "電腦軟體應用丙級", desc: "互動式網站教材，術科題組一步步帶著做。", url: "classC/classC/index.html", date: "2026-03-01", featured: true, tag: "互動教材" },
  { cat: "cert", title: "GoGo421 搞怪版", desc: "丙級學科刷題機，一直刷到全部答對。", url: "gogo421/index.html", date: "2026-03-01", tag: "刷題" },

  // ---- 數概 ----
  { cat: "dt", title: "數概第三章複習站", desc: "第三章重點整理與每日複習挑戰。", url: "bcc_ch3_adv.html", date: "2026-03-01", tag: "複習" },
  { cat: "dt", title: "數概第三章進階複習系統", desc: "第三章進階題目，一題一題練到熟。", url: "https://iamfefe.github.io/bcc-ch3-review/", date: "2026-11-27", tag: "複習系統" },
  { cat: "dt", title: "數概第三章必背重點", desc: "Canva 重點整理，考前快速看一遍。", url: "https://canva.link/gropzbjvyvybc24", frame: false, date: "2026-11-27", tag: "重點" },
  { cat: "dt", title: "數概第三章重點記憶卡", desc: "翻卡片背重點，邊玩邊記。", url: "https://iamfefe.github.io/bcc-chp3-mgame/", date: "2026-11-27", tag: "記憶卡" },

  { cat: "dt", title: "GoGoBCC 數概複習", desc: "選項亂序、錯題解析與記憶口訣，一路練到全部答對。", url: "https://iamfefe.github.io/GoGoBCC/", date: "2026-10-29", tag: "刷題" },

  // ---- 數應 ----
  { cat: "da", title: "數應二段複習系統", desc: "二段範圍的線上複習系統。", url: "https://iamfefe.github.io/bcc-app47-review/", date: "2026-11-27", tag: "複習系統" },
  { cat: "da", title: "數應二段必背重點", desc: "Canva 重點整理，二段必背一次看完。", url: "https://canva.link/rd5zacqggkyk49r", frame: false, date: "2026-11-27", tag: "重點" },
  { cat: "da", title: "數應二段速背記憶卡", desc: "翻卡片速背二段重點。", url: "https://iamfefe.github.io/bcc-app47-mgame/", date: "2026-11-27", tag: "記憶卡" },
  { cat: "da", title: "Word 快速鍵配對大挑戰", desc: "把常用快速鍵配對起來，越快越好。", url: "hotkey.html", date: "2026-03-01", tag: "小遊戲" },
  { cat: "da", title: "AI 生活解題設計師", desc: "四人一組，用 Canva 跟著四個階段完成提案簡報。", url: "mdproject.html", date: "2026-03-01", tag: "專題實作" },

  // ---- 多媒體 ----
  { cat: "mm", title: "光影練習室", desc: "攝影互動教室：主體、構圖、光線與背景。", url: "photo/index.html", date: "2026-03-01", featured: true, tag: "互動教材" },

  // ---- 網頁 ----
  { cat: "web", title: "Modern UI Team Card", desc: "網頁課範例：做一張有音樂、影片的團隊名片。", url: "sample.html", date: "2026-03-01", tag: "範例" },
  { cat: "web", title: "可愛留言板", desc: "網頁範例：輸入名字和留言的小留言板。", url: "https://iamfefe.github.io/board/", date: "2026-09-29", tag: "範例" },
  { cat: "web", title: "專業測驗系統", desc: "串接 Google 試算表的隨機測驗與成績表。", url: "https://iamfefe.github.io/construct/", date: "2026-04-15", tag: "範例" },

  // ---- 打字 ----
  { cat: "type", title: "打字練習 Fefe 版", desc: "學校主機上的線上打字練習，直接開始練。", url: "typing/#practice", date: "2026-11-27", tag: "線上練習" },

  // ---- 升學 ----
  { cat: "path", title: "設計群升學地圖", desc: "多媒體設計科高一必看的升學路線圖。", url: "site/index.html", date: "2026-03-01", tag: "指引" },
  { cat: "path", title: "設計群統測選採科目", desc: "各校系統測選採科目一覽。", url: "site/設計群統測選採科目_1151022.html", date: "2026-03-01", tag: "資料" },
  { cat: "path", title: "角色設計講者提醒", desc: "設計群升學指引：角色設計重點與提醒。", url: "role.html", date: "2026-03-01", tag: "指引" },

  // ---- 工具 ----
  { cat: "tool", title: "快記行事曆", desc: "打一句「12/5 15:00 看牙醫」就記好行程，資料存在自己的瀏覽器。", url: "https://iamfefe.github.io/ccalendar/", date: "2026-11-25", tag: "小工具" },

  // ---- 其他 ----
  { cat: "misc", title: "問卷研究所", desc: "高中專題闖關自學：12 個問卷研究任務。", url: "query.html", date: "2026-03-01", tag: "專題" },
  { cat: "misc", title: "AEIOU 空間偵探", desc: "圖書館大搜查！用 AEIOU 觀察空間。", url: "game1.html", date: "2026-03-01", tag: "小遊戲" },
  { cat: "misc", title: "AEIOU 圖書館分類挑戰", desc: "AEIOU Library Challenge 分類闖關。", url: "game2.html", date: "2026-03-01", tag: "小遊戲" },
  { cat: "misc", title: "德州日光 · 2026 旅行手記", desc: "從奧斯汀到休士頓，德州旅行與進修生活的互動影像手記。", url: "https://iamfefe.github.io/texas-days-2026/", date: "2026-10-24", tag: "手記" }
];
