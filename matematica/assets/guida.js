
"use strict";
(() => {
const paths=[
  {id:"dominio",name:"Dominio"},
  {id:"segno",name:"Studio del segno"},
  {id:"inversa",name:"Funzione inversa"},
  {id:"composizione",name:"Composizione"}
];
const storePrefix="tutoring-matematica-v1:";
const key=id=>storePrefix+id;
function isDone(id){try{return localStorage.getItem(key(id))==="1"}catch(e){return false}}
function setDone(id,val){try{localStorage.setItem(key(id),val?"1":"0")}catch(e){}}
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const math=(s,block=false)=>'<span class="math-expression'+(block?' big':'')+'">\\('+esc(s)+'\\)</span>';
const node=(tag,cls,text)=>{let el=document.createElement(tag);if(cls)el.className=cls;if(text!=null)el.textContent=text;return el};
const href=id=>"../"+id+"/";
function typeset(target){if(window.MathJax&&typeof MathJax.typesetPromise==="function"){MathJax.typesetPromise(target?[target]:undefined).catch(()=>{})}}
function total(){return paths.filter(p=>isDone(p.id)).length}
function syncMarks(){document.querySelectorAll("[data-path]").forEach(el=>{const id=el.dataset.path;const done=isDone(id);let badge=el.querySelector(".tick");if(done&&!badge){badge=node("span","tick","✓");badge.setAttribute("aria-label","completato");el.appendChild(badge)}if(!done&&badge)badge.remove()});document.querySelectorAll("[data-progress]").forEach(el=>el.textContent=total()+"/4");document.querySelectorAll("[data-progressbar]").forEach(el=>el.style.width=(total()/4*100)+"%")}
function render(){
 const dataEl=document.getElementById("lesson-data");if(!dataEl)return;
 const d=JSON.parse(dataEl.textContent);
 const current=paths.findIndex(p=>p.id===d.id);
 const root=document.getElementById("app");
 const detailed=(d.id==="segno"||d.id==="inversa");
 const rules=d.rules.map((r,i)=>{
   if(detailed) return '<article class="concept-block"><div class="concept-label">Concetto '+(i+1)+'</div><h3>'+esc(r.title)+'</h3>'+(r.tex?'<div class="concept-tex">'+math(r.tex)+'</div>':'')+'<p>'+esc(r.info)+'</p>'+(r.visual?'<div class="visual-slot" data-visual="'+esc(r.visual)+'"></div>':'')+'</article>';
   return '<article class="rule"><div class="section-label">Concetto '+(i+1)+'</div><h3>'+esc(r.title)+'</h3><div class="formula">'+math(r.tex)+'</div><p>'+esc(r.info)+'</p></article>';
 }).join("");
 const maps=d.map.map((m)=>'<div class="map-item"><b>'+esc(m.title)+'</b><span>'+esc(m.text)+'</span></div>').join("");
 const showMap=d.id!=="inversa";
 const mapSection=showMap?'<section id="mappa" class="section"><div class="section-label">Da dove cominciare</div><h2>La mappa dei passaggi</h2><div class="panel"><p class="lead">'+esc(d.intro)+'</p><div class="map">'+maps+'</div></div></section>':'';
 const domainSummary=d.id==="dominio"?'<div class="domain-summary"><h3>Ultimo passo: scrivi il dominio</h3><p>Risolvi le tre possibili condizioni e <strong>interseca</strong> i risultati: devono essere tutte rispettate. Non serve usare ogni condizione se non compare nella funzione.</p><p>Per esempio, con <strong>f(x) = ln(x) / (x − 1)</strong> si richiedono x &gt; 0 e x ≠ 1.</p><div class="formula block">D = { x ∈ ℝ | x &gt; 0 ∧ x ≠ 1 }</div><p class="domain-read">Si legge: «l’insieme di tutti gli x reali tali che x &gt; 0 e x diverso da 1».</p></div>':'';
 const guided=d.guided.map((g,i)=>'<article class="panel worked" data-work="'+i+'"><div class="work-head"><span class="pill">Esempio '+(i+1)+'</span><span class="mini">'+'Svolgimento guidato'+'</span></div><h3>'+esc(g.title)+'</h3><div class="formula block">'+math(g.tex,true)+'</div><p class="lead">'+esc(g.intro)+'</p><div class="steps">'+g.steps.map((s,j)=>'<div class="step" '+(j?'hidden':'')+'><span class="step-no">'+(j+1)+'</span><div class="step-body"><strong>'+esc(s.title)+'</strong>'+(s.tex?'<div class="formula">'+math(s.tex)+'</div>':'')+'<p>'+esc(s.text)+'</p></div></div>').join("")+'</div><div class="result" hidden><strong>Risultato</strong><div class="formula">'+math(g.result)+'</div>'+(g.note?'<p style="font-size:.87rem;margin:4px 0 0">'+esc(g.note)+'</p>':'')+'</div><div class="actions"><button class="btn primary reveal" type="button">Mostra il passaggio successivo</button><span class="mini status" aria-live="polite"></span></div></article>').join("");
 const books=d.book.map((e,i)=>'<details class="exercise"><summary><span class="num">'+(i+1)+'</span><span class="exp">'+math(e.tex)+'</span></summary><div class="solution"><strong>Risultato</strong><div class="formula">'+math(e.result)+'</div><p>'+esc(e.reason)+'</p></div></details>').join("");
 const quiz=d.quiz.map((q,i)=>'<article class="question" data-question="'+i+'"><div class="section-label">Domanda '+(i+1)+' di '+d.quiz.length+'</div><h3>'+esc(q.prompt)+'</h3>'+(q.tex?'<div class="formula">'+math(q.tex)+'</div>':'')+'<div class="answers">'+q.options.map((a,j)=>'<button type="button" class="answer" data-answer="'+j+'">'+math(a)+'</button>').join('')+'</div><div class="feedback" aria-live="polite"></div></article>').join("");
 root.innerHTML='<div class="wrap"><div class="crumbs"><a href="../../">Tutte le materie</a><span>›</span><a href="../">Matematica</a><span>›</span>'+esc(d.title)+'</div><section class="hero '+(d.tone||'')+'"><div class="eyebrow">Percorso '+(current+1)+' di 4 · Matematica</div><h1>'+esc(d.title)+'</h1><p>'+esc(d.subtitle)+'</p><div class="stats"><span class="stat">'+d.book.length+' esercizi pratici</span><span class="stat">'+d.guided.length+' esempi guidati</span><span class="stat">'+d.quiz.length+' domande di verifica</span></div></section><nav class="pathnav" aria-label="Percorsi di matematica">'+paths.map((p,i)=>'<a data-path="'+p.id+'" href="'+href(p.id)+'" '+(p.id===d.id?'class="current" aria-current="page"':'')+'><span class="number">'+(i+1)+'</span><span>'+p.name+'</span></a>').join('')+'</nav><div class="bodygrid"><div class="chapter">'+mapSection+'<section id="regole" class="section"><div class="section-label">Prima la teoria</div><h2>Concetti chiave</h2>'+(!showMap?'<p class="lead">'+esc(d.intro)+'</p>':'')+'<div class="'+(detailed?'concept-stack':'rules')+'">'+rules+'</div>'+domainSummary+'<div class="tip warn">'+esc(d.pitfall)+'</div></section><section id="esempi" class="section"><div class="section-label">Con calma, un passaggio alla volta</div><h2>Esempi svolti</h2>'+guided+'</section><section id="esercizi" class="section"><div class="section-label">Mettiti alla prova</div><h2>Esercizi di allenamento</h2><div class="panel"><p>Prova a risolvere ogni esercizio prima di aprire il riquadro: troverai il <strong>risultato e il ragionamento essenziale</strong>. Le formule e i dati necessari sono già qui.</p></div><div class="exercise-list">'+books+'</div></section><section id="quiz" class="section"><div class="section-label">Ora tocca a te</div><h2>Verifica interattiva</h2><p class="lead">Scegli una risposta per domanda. Dopo ogni scelta trovi una spiegazione; i tuoi risultati restano su questo dispositivo.</p><div class="quiz">'+quiz+'</div><div class="quiz-score" hidden aria-live="polite"></div></section><section class="complete"><h2>Hai ripassato questo argomento?</h2><p>Puoi segnarlo come completato e tornare quando vuoi per allenarti di nuovo.</p><button type="button" class="btn primary complete-btn">Segna come ripassato</button><div class="complete-status" aria-live="polite"></div></section><nav class="pager" aria-label="Altri percorsi"><a href="../">← Indice Matematica</a>'+(current<3?'<a href="'+href(paths[current+1].id)+'">Prossimo: '+esc(paths[current+1].name)+' →</a>':'<a href="../">Tutti gli argomenti →</a>')+'</nav></div><aside class="side"><div class="sidepanel"><div class="eyebrow">In questa guida</div>'+(showMap?'<a href="#mappa">01 · La mappa</a>':'')+'<a href="#regole">'+(showMap?'02':'01')+' · Concetti chiave</a><a href="#esempi">'+(showMap?'03':'02')+' · Esempi svolti</a><a href="#esercizi">'+(showMap?'04':'03')+' · Esercizi</a><a href="#quiz">'+(showMap?'05':'04')+' · Verifica</a></div><div class="sidepanel"><div class="eyebrow">Progressi</div><strong><span data-progress>0/4</span> percorsi completati</strong><div class="progress-track"><span data-progressbar></span></div><span class="mini">Salvati nel browser, non serve registrarsi.</span></div></aside></div></div><footer><div class="wrap">Tutoring · Matematica <span style="float:right"><a href="../../">Homepage</a></span></div></footer>';
 document.querySelectorAll("[data-visual]").forEach(slot=>{if(window.TutoringMathVisuals)window.TutoringMathVisuals.mount(slot.dataset.visual,slot)});
 // Guided reveals
 document.querySelectorAll(".worked").forEach(card=>{
 const steps=[...card.querySelectorAll(".step")],res=card.querySelector(".result"),btn=card.querySelector(".reveal"),status=card.querySelector(".status");
 let visible=1;status.textContent='Passaggio 1 di '+steps.length;
 btn.addEventListener("click",()=>{
  if(visible<steps.length){steps[visible].hidden=false;visible++;status.textContent='Passaggio '+visible+' di '+steps.length;if(visible===steps.length)btn.textContent="Mostra il risultato";}
  else{res.hidden=false;btn.disabled=true;btn.textContent="Esempio completo";status.textContent="Procedimento completo";}
  typeset(card);
 });
 });
 // Interactive MCQs
 let score=0,answered=0;
 document.querySelectorAll(".question").forEach((card,i)=>{
  const q=d.quiz[i],buttons=[...card.querySelectorAll(".answer")],feedback=card.querySelector(".feedback");
  buttons.forEach((b,j)=>b.addEventListener("click",()=>{
   if(card.dataset.answered)return;card.dataset.answered="1";answered++;
   buttons.forEach((bt,k)=>{bt.disabled=true;if(k===q.correct)bt.classList.add("right");if(k===j && j!==q.correct)bt.classList.add("wrong")});
   if(j===q.correct){score++;feedback.className="feedback good";feedback.textContent="Corretto. "+q.explain}
   else{feedback.className="feedback bad";feedback.textContent="Non esatto. "+q.explain}
   const board=document.querySelector(".quiz-score");
   if(answered===d.quiz.length){board.hidden=false;board.textContent="Risultato: "+score+" risposte corrette su "+d.quiz.length+"."; }
  }));
 });
 const cb=document.querySelector(".complete-btn"),cs=document.querySelector(".complete-status");
 function completionUi(){const done=isDone(d.id);cb.className="btn "+(done?"success":"primary")+" complete-btn";cb.textContent=done?"✓ Ripasso completato · annulla":"Segna come ripassato";cs.textContent=done?"Completato su questo dispositivo.":"Ancora da completare.";syncMarks()}
 cb.addEventListener("click",()=>{setDone(d.id,!isDone(d.id));completionUi()});completionUi();
 typeset(root);
 window.addEventListener("load",()=>typeset(root),{once:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render);else render();
})();
