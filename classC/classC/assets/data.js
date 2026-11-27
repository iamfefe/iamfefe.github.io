/* 丙級操作筆記資料（打勾清單）與測驗 */

const CK = {
 step1: ['檔案總管', [
  '「詳細資料」/ 按右鍵可以開欄位（修改日期、類型、大小）',
  '檢視 / 顯示 / 副檔名',
  '按標題（名稱或大小）/ 切換小到大或大到小',
  '<b>排序規則</b>：題組 1~12 主資料夾「名稱→小到大」＋子資料夾「大小→大到小」；<b>題組 13~15 兩個方向都相反</b>',
  '檢視 / 顯示 / 精簡顯示',
  '搜尋：<code>*c.odt OR *.gif</code>',
  '<code>Ctrl+A</code> 全選、<code>Ctrl+V</code> 貼上',
  '視窗要顯示所有檔案 → <code>Alt+PrintScreen</code>',
  'Word / 版面配置 / 窄（依題目）',
  '注意貼上答案順序正確',
  '第二小題可用「類型」分類；<b>題組 5、6 用「大小」</b>做分類',
  '存檔 <code>1-1.pdf</code>',
 ]],
 step2: ['目錄製作', [
  '直接開啟 odt 檔（可用右鍵選擇以 Word 開啟）',
  '在作者下，先打「目錄」與「圖目錄」',
  '版面配置 / 分隔符號：在「目」前插「分節符號的下一頁」（下一頁的前面也插入一個）',
  '常用 / 顯示隱藏標記',
  '插入 / 頁碼 / 目前位置',
  '進入第 2 節頁尾 / <b>取消「連結到前一節」</b> / 刪除封面頁碼',
  '第 2 節頁碼格式：<code>i、ii、iii</code> / 起始頁碼 i / Arial / 14 點 / 靠右',
  '第 3 節頁碼：數字格式 <code>1、2、3</code> / 起始頁碼 1（<b>題組十一要加 - 號，注意半形</b>；點閃點／停止建立）',
  '插入 / 頁碼 / 頁面頂端 / 靠右（看題目）/ 座號姓名 / Arial＋標楷體 14',
  '選取圖片 / 參考資料 / 插入<b>標號</b> / 新增「圖」標籤 / 打：/ 把原圖片標題複製格式過來變成同一行',
  '複製「圖1：」/ 貼到第二張圖片名稱前 / 右鍵 / <b>更新功能變數</b>',
  '游標停在第一層標題中間 / 選取「所有類似格式的文字」/ 段落設定 / 大綱階層設為「<b>階層一</b>」',
  '選取第二層標題 / 段落設定 / 大綱階層設為「<b>階層二</b>」',
  '滑鼠移到「目錄」兩個字後 / 參考資料 / 自訂目錄 / 確定',
  '在第一列目錄前用白箭頭選段落 / 改 16 點、標楷體與 Times New Roman',
  '目錄第二層：中文標楷體 14 點 / 縮排 32 點',
  '游標放在「圖目錄」後 / 參考資料 / 插入圖表目錄',
  '列印設定 / 每張紙 2 頁 / 確認共 3 張 A4',
  '存成 <code>1-2.pdf</code>',
 ]],
 step3: ['合併列印', [
  '開新檔案 / 郵件 / 選取收件者 / 使用現有清單',
  '編輯收件者清單 / 篩選（照題目）、排序（照題目）',
  '<b>題組七</b>：篩選地址大於基隆市中山區、小於基隆市中正區',
  '<b>題組十一</b>：名稱排序後取消屬於 SuperVGA，再按名稱遞增（或篩選名稱小於 SuperVGA）',
  '郵件 / 開始郵件合併 / 標籤 / <b>標籤選項</b>（不是「新增標籤」）',
  '標籤名稱 1 / A4，照題目',
  '點框線鈕 / 檢視格線',
  '設定字形（照題目）/ 插入合併欄位',
  '郵件 / 更新標籤',
  '加頁首頁尾 / 新細明體＋Arial 10',
  '<b>另存原始文件</b>（先存再合併）',
  '郵件 / 完成並合併（完成與合併→文件）',
  '沒資料的要刪掉',
  '<b>另存結果文件</b>',
  '註：題組四、九、十四 → 選取整個表格 / 版面配置的「前」輸入 <code>0</code>',
 ]],
 step4a: ['文書處理：準備動作', [
  '檔案 / 選項 / 進階 / 顯示：<b>度量單位設為公分</b>、取消「以字元單位顯示」；檢視 / 勾尺規（gogo123 技巧：公分&尺規設定）',
  '檢視 / 顯示隱藏標記',
  '圖片類 / 版面配置 / 文繞圖 / 矩形 / 左右可調',
  '表格類 / 右鍵 / 表格內容 / 選項 / 左右間距 0',
 ]],
 step4b: ['文書處理：文書編輯', [
  '版面設定 3 3 3 3',
  '做頁首頁尾三欄，注意中英字型（新細、Ti）',
  '插入 / 物件 / 文字檔',
  '打上缺的字（注意全半形；很多英文字時先一起打好會比較快）',
  '每一段後加按一個 Enter 換行',
  '取代：<code>^p → ***</code>',
  '取代：<code>****** → ^p</code>',
  '取代：<code>*** → （空）</code>',
  '全選 / 字型與樣式：新細明體、Times、12pt',
  '全選 / 段落：左右對齊 / 第一行縮排 2 字元 / 行高 18pt / 中文印刷樣式三個勾拿掉（前後段距離要為 0）',
  '注意括號等全半形（<code>Shift+空白鍵</code>可切換全半形）',
  '照答案改',
  '表格內容可以先插入再移動比較近，記得改字型！',
 ]],
 step4c: ['文書處理：欄', [
  '版面配置 / 欄 / 其他欄 / 三 / 勾分隔線 / 間距 1 公分',
 ]],
 terms: ['學期過關清單', [
  '檔案管理 15 題組全部練習並通過至少一次',
  '目錄製作：能獨立完成題組一、六、十一',
  '合併列印 5 種題型熟練＋特例題組七、十一',
  '文書處理：一題組能在 30 分鐘內完成',
  '碁峰學科考試系統模擬通過一次',
  'gogo421／學科練習系統刷題達標',
  '完成公正考試（筆試）登記',
 ]],
};

const QUIZ = [
 {q:'<code>Ctrl + U</code> 開啟的是？', a:['曲線','色相／飽和度','儲存'], c:1,
  why:'Ctrl+U 是色相／飽和度；曲線是 Ctrl+M，兩者要分開記。'},
 {q:'<code>Ctrl + M</code> 開啟的是？', a:['曲線','置中','色彩平衡'], c:0, why:'Ctrl+M 是曲線（Curves），用來調整明暗層次。'},
 {q:'切換全形／半形常用哪個按鍵？', a:['Shift＋空白鍵','Ctrl＋空白鍵','Alt＋Enter'], c:0,
  why:'Shift＋空白鍵可切換全半形，打題目缺字時非常常用。'},
 {q:'全選的快捷鍵是？', a:['Ctrl+A','Ctrl+S','Ctrl+F'], c:0, why:'Ctrl+A 全選；檔案總管裡也一樣。'},
 {q:'學科筆試每題幾分、答錯會倒扣嗎？', a:['1 分、會倒扣','1.25 分、不倒扣','2 分、不倒扣'], c:1,
  why:'每題 1.25 分、滿分 100 分，答錯不倒扣，千萬不要留白。'},
 {q:'術科上機實作的時間是？', a:['90 分鐘','100 分鐘','120 分鐘'], c:2,
  why:'術科 120 分鐘、15 個題組；學科才是 100 分鐘。'},
];

const GOGO = 'https://gogo123.com.tw/%e9%9b%bb%e8%85%a6%e8%bb%9f%e9%ab%94%e6%87%89%e7%94%a8%e4%b8%99%e7%b4%9a-office-2021%e3%80%90109%e5%b9%b4%e5%95%9f%e7%94%a8%e8%a9%a6%e9%a1%8c%e3%80%91/';
const GOGO_COLS = ['01 版面設定','02 文字處理','03 圖片處理','04 表格處理'];
const GOGO_ROWS = ['一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四','十五'];

/* gogo123 實際影片 id（2026-11 自查詢頁面擷取，若失效請改回 GOGO 總頁） */
const VIDS = {
 file: [
  ['🎬 Windows 11 檔案總管：基本操作及設定','R_5UeZg8M68'],
  ['🎬 題組一','XXuR2k6cxSU'],
  ['🎬 題組十三','ZDLngNwhBAE'],
  ['🎬 題組5及題組6【子檔案選取方法】','s-aZiRRCRZw'],
 ],
 toc: [
  ['🎬 題組一','VZ25nq_dRtE'],
  ['🎬 題組六','9q6Ob9o_eVE'],
  ['🎬 題組十一','fWyLatZjy7E'],
  ['🎬 題組二（2欄式內容）','TAmT6cskeo8'],
  ['🎬 目錄製作的列印設定','_wUSd6W9Kjo'],
 ],
 merge: [
  ['🎬 題組一','dqK0htzFXQg'],
  ['🎬 題組二','PjaZ15CUTVg'],
  ['🎬 題組三','kr1wrvk3NtU'],
  ['🎬 題組四','yMg6uq8PdUE'],
  ['🎬 題組五','BGM0KbwQYJU'],
  ['🎬 題組七【篩選做法】','ppductp4rX0'],
  ['🎬 題組十一【篩選做法】','ppductp4rX0&t=146s'],
  ['🎬 題組4、9、14 主文件未完整顯示解決方式','ey-DRGRw3hs'],
 ],
 wordtips: [
  ['🎬 公分＆尺規設定','oxybjTs9X9M'],
  ['🎬 圖片設定','c9Ed0F_ZS9Y'],
  ['🎬 表格設定','9y80Nro81Bk'],
 ],
};

const PDFANS = [
 ['📄 15題－目錄（PDF參考答案）','https://drive.google.com/file/d/1BnFQm_43O5AMBMe4mckdqIejazrrQh46/view?usp=sharing'],
 ['📄 15題－合併列印（PDF參考答案）','https://drive.google.com/file/d/1Z78Xv2VShLWRdeBznTn4wQ4M3ipV8fxT/view?usp=sharing'],
 ['📄 15題－文書處理（PDF參考答案）','https://drive.google.com/file/d/1jvRdjxCWExHTLmJinoCkltIfnI6fJr0d/view?usp=sharing'],
];

/* 文書處理 15 題組 × 4 小题影片 id */
const DOCVIDS = [
 ['QEUoMw9sDks','yIBIu6GFNFk','qTiaj_NmWRM','rMFBMnH2dsA'],
 ['bIoyvsYPSS0','nzgLWN2kOEM','KJLSyJx4T1Y','6sBqlUBhcGk'],
 ['l0o6_Y6B5YI','jTnCdOa9C2s','CNb96BFDzAY','si94xuRAgSw'],
 ['cZoCSJ94sH4','DbLDyBYyuuI','yrMd-BG72Ek','ybj4GGg5iKs'],
 ['4CwLrCgVCP4','B8xhZA8H1pk','MSTArlFO6cQ','dvVD-PbGbhc'],
 ['9RZZ02TQpmA','3TV1pnqzugk','DYtvOj_Hv-U','lrIUTUYzJS4'],
 ['0x30_TkFiAk','HTLBhNgCYHQ','ktft86qHJkg','eiWy8jxLiZQ'],
 ['r9X9TeAQgHg','s3OR6vX3PB4','YGfMoJgYMtU','I9Tl2vRNwx8'],
 ['xNrYAJVitYM','dlNFWPd6LiU','xcapZf1G-qo','qzhikRm3xPg'],
 ['BKDofS5cvco','9YT-KSu2e6E','AyyQ870yybA','RKodTLyODMk'],
 ['khO-XsnRvvc','iXBCpOCnZwY','99DThLHfRGc','Q3Tg40bnBvg'],
 ['DEgd9zgQfgI','0tWhS1zz0WA','79miwnfVXb4','4wvf5-ktxec'],
 ['kSvW-DZ0I0k','xw29Pf5ogMY','5pAOtE8QGYk','GTVqTQrQF9I'],
 ['yQaM_zJ8V60','Q4DNXBrKNIw','CdHSFxpFt70','IPCGH1M4P_Y'],
 ['la-7Yjqg-6E','cNtDNTEQHhc','sY5V1_HVpak','vFFs74ArgxI'],
];
