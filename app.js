/* Общий скрипт: тема, размер шрифта, «наверх», отметки прочтения */
(function(){
  var root=document.documentElement, body=document.body;
  var LS=function(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v);}catch(e){return null;} };

  /* тема: сохранённая, иначе — системная */
  var theme=LS('fa_theme');
  if(!theme){
    theme=(window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark';
  }
  root.setAttribute('data-theme',theme);
  var themeBtn=document.getElementById('themeBtn');
  if(themeBtn){
    themeBtn.textContent=theme==='dark'?'🌙':'☀️';
    themeBtn.onclick=function(){
      theme=theme==='dark'?'light':'dark';
      root.setAttribute('data-theme',theme);
      themeBtn.textContent=theme==='dark'?'🌙':'☀️';
      LS('fa_theme',theme);
    };
  }

  /* размер шрифта */
  var fs=parseInt(LS('fa_fs')||'19',10);
  function applyFs(){ body.style.setProperty('--fs',fs+'px'); LS('fa_fs',String(fs)); }
  applyFs();
  var plus=document.getElementById('fsPlus'), minus=document.getElementById('fsMinus');
  if(plus) plus.onclick=function(){ if(fs<26){fs++;applyFs();} };
  if(minus) minus.onclick=function(){ if(fs>15){fs--;applyFs();} };

  /* кнопка «наверх» и полоса прогресса */
  var prog=document.getElementById('progress'), totop=document.getElementById('totop');
  window.addEventListener('scroll',function(){
    var h=document.documentElement.scrollHeight-window.innerHeight;
    if(prog) prog.style.width=(h>0?(window.scrollY/h*100):0)+'%';
    if(totop) totop.classList.toggle('show',window.scrollY>600);
  },{passive:true});
  if(totop) totop.onclick=function(){ window.scrollTo({top:0,behavior:'smooth'}); };

  /* подсветка текущего пункта меню */
  var here=location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.topnav a').forEach(function(a){
    if(a.getAttribute('href')===here) a.classList.add('current');
  });

  /* мобильное меню разделов (гамбургер в шапке) */
  var navToggle=document.getElementById('navToggle');
  var topnav=document.querySelector('.topnav');
  if(navToggle && topnav){
    var navBackdrop=document.createElement('div');
    navBackdrop.className='nav-backdrop';
    document.body.appendChild(navBackdrop);
    /* блокируем скролл фона через touchmove, а не overflow:hidden —
       переключение overflow на <body> на Android Chrome иногда оставляет
       визуальные артефакты на соседних элементах (sticky/blur) */
    var lockTouch=function(e){ if(!topnav.contains(e.target)) e.preventDefault(); };
    var closeNav=function(){
      topnav.classList.remove('open');
      navBackdrop.classList.remove('show');
      document.removeEventListener('touchmove',lockTouch);
      navToggle.setAttribute('aria-expanded','false');
      navToggle.textContent='☰';
    };
    var openNav=function(){
      topnav.classList.add('open');
      navBackdrop.classList.add('show');
      document.addEventListener('touchmove',lockTouch,{passive:false});
      navToggle.setAttribute('aria-expanded','true');
      navToggle.textContent='✕';
    };
    navToggle.setAttribute('aria-expanded','false');
    navToggle.onclick=function(e){
      e.stopPropagation();
      if(topnav.classList.contains('open')) closeNav(); else openNav();
    };
    topnav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',closeNav); });
    navBackdrop.addEventListener('click',closeNav);
    document.addEventListener('click',function(e){
      if(topnav.classList.contains('open') && !topnav.contains(e.target) && e.target!==navToggle) closeNav();
    });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') closeNav(); });
    window.addEventListener('resize',function(){ if(window.innerWidth>900) closeNav(); });
  }

  /* API отметок прочтения */
  window.FA={
    total:33,
    getRead:function(){ try{ return JSON.parse(LS('fa_read')||'[]'); }catch(e){ return []; } },
    setRead:function(arr){ LS('fa_read',JSON.stringify(arr)); },
    markRead:function(id){ var r=this.getRead(); if(r.indexOf(id)<0){ r.push(id); this.setRead(r);} },
    isRead:function(id){ return this.getRead().indexOf(id)>=0; }
  };

  /* service worker для офлайн-доступа (PWA/Android-обёртка) */
  if('serviceWorker' in navigator){
    window.addEventListener('load',function(){
      navigator.serviceWorker.register('sw.js').catch(function(){});
    });
  }
})();
