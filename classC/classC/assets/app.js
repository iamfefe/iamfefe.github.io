const NAVS = [
  ['home','🏠 首頁'],['exam','🧾 檢定考什麼'],['links','🧰 軟體與練習'],
  ['step1','① 檔案總管'],['step2','② 目錄製作'],['step3','③ 合併列印'],['step4','④ 文書處理'],
  ['tips','🔎 檢查細節'],['rules','📏 課堂規定'],
];
const nav = document.getElementById('nav');
NAVS.forEach(([id,label])=>{
  const b=document.createElement('button'); b.textContent=label; b.dataset.id=id;
  b.onclick=()=>location.hash=id; nav.appendChild(b);
});
function show(id){
  if(!document.getElementById(id)) id='home';
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.id===id));
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',()=>show(location.hash.slice(1)));
show(location.hash.slice(1)||'home');

/* ---------- 打勾清單 ---------- */
const keys = Object.keys(CK);
let totalItems = 0;
keys.forEach(key=>{
  const [title, items] = CK[key];
  const wrap = document.getElementById('ck-'+key); if(!wrap) return;
  const head=document.createElement('div'); head.className='ckhead';
  head.innerHTML='<h3>'+title+'</h3><span class="ckstat" id="st-'+key+'"></span>';
  wrap.appendChild(head);
  items.forEach((it,i)=>{
    totalItems++;
    const lab=document.createElement('label');
    const cb=document.createElement('input'); cb.type='checkbox'; cb.dataset.key=key;
    cb.checked=localStorage.getItem('ck_'+key+'_'+i)==='1';
    const span=document.createElement('span'); span.innerHTML=it;
    lab.appendChild(cb); lab.appendChild(span);
    if(cb.checked) lab.classList.add('ck');
    cb.onchange=()=>{
      localStorage.setItem('ck_'+key+'_'+i,cb.checked?'1':'0');
      lab.classList.toggle('ck',cb.checked); refresh();
    };
    wrap.appendChild(lab);
  });
});
function refresh(){
  keys.forEach(key=>{
    const wrap=document.getElementById('ck-'+key); if(!wrap) return;
    const cbs=wrap.querySelectorAll('input');
    const doneN=[...cbs].filter(x=>x.checked).length;
    const st=document.getElementById('st-'+key);
    if(st) st.textContent=doneN+' / '+cbs.length;
    const mini=document.getElementById('mini-'+key);
    if(mini) mini.innerHTML='<i style="width:'+(cbs.length?doneN/cbs.length*100:0)+'%"></i>';
  });
  const all=[...document.querySelectorAll('.ckwrap input')];
  const p=all.length?Math.round(all.filter(x=>x.checked).length/all.length*100):0;
  document.getElementById('allProgress').textContent=p+'%';
  document.getElementById('allBar').style.width=p+'%';
}
refresh();

/* ---------- gogo123 文書處理影片索引表（直接連結） ---------- */
const tb=document.getElementById('videoTable');
tb.innerHTML='<tr><th>題組</th>'+GOGO_COLS.map(c=>'<th>'+c+'</th>').join('')+'</tr>'+
  GOGO_ROWS.map((r,ri)=>'<tr><th>'+r+'</th>'+
    GOGO_COLS.map((_,ci)=>'<td><a href="https://youtu.be/'+DOCVIDS[ri][ci]+'" target="_blank" rel="noopener">🎬 '+(ri+1)+'-0'+(ci+1)+'</a></td>').join('')+
  '</tr>').join('');

/* ---------- 各步驟的 gogo123 影片列 ---------- */
function vidrow(boxId, list){
  const box=document.getElementById(boxId); if(!box) return;
  box.innerHTML='<span class="vlabel">📺 推薦教學影片：</span>'+
    list.map(([t,id])=>'<a href="https://youtu.be/'+id+'" target="_blank" rel="noopener">'+t+'</a>').join('');
}
vidrow('vids-step1',VIDS.file);
vidrow('vids-step2',VIDS.toc);
vidrow('vids-step3',VIDS.merge);
vidrow('vids-step4',VIDS.wordtips);
const pdfbox=document.getElementById('pdfAns');
if(pdfbox) pdfbox.innerHTML=PDFANS.map(([t,u])=>'<a href="'+u+'" target="_blank" rel="noopener">'+t+'</a>').join('');

/* ---------- 測驗 ---------- */
const quizBox=document.getElementById('quiz');
QUIZ.forEach((q,qi)=>{
  const d=document.createElement('div'); d.className='qcard';
  d.innerHTML='<b>Q'+(qi+1)+'. '+q.q+'</b><div class="opts"></div><div class="why">💡 '+q.why+'</div>';
  const opts=d.querySelector('.opts');
  q.a.forEach((op,oi)=>{
    const b=document.createElement('button'); b.innerHTML=op;
    b.onclick=()=>{
      if(d.classList.contains('done'))return;
      if(oi===q.c){b.classList.add('right');d.classList.add('done');}
      else{b.classList.add('wrong');setTimeout(()=>b.classList.remove('wrong'),500);}
    };
    opts.appendChild(b);
  });
  quizBox.appendChild(d);
});
