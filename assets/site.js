
(function(){
"use strict";
const current=document.currentScript;
const root=new URL(current?.getAttribute("data-root")||"./",document.baseURI);
const topics=[
 {title:"C++ · Variabili, funzioni e procedure",category:"Informatica",path:"informatica/cpp-sottoprogrammi/",description:"Tipi int, float, double e string; parametri, return, void, chiamate, esempi ed esercizi.",keywords:"c++ cpp cplusplus programmazione codice sottoprogrammi variabile variabili tipi tipo funzione funzioni procedura procedure void return main parametri formali attuali output input"},
 {title:"Dominio delle funzioni",category:"Matematica",path:"matematica/dominio/",description:"Condizioni di esistenza: radici, frazioni, logaritmi, esponenziali e intervalli.",keywords:"dominio condizioni esistenza denominatore radicando logaritmo logaritmi frazioni esponenziale radici funzione insieme definizione"},
 {title:"Studio del segno",category:"Matematica",path:"matematica/segno/",description:"Funzioni positive e negative, zeri, intersezioni con gli assi e tabella dei segni.",keywords:"segno positività negativa zeri zero intersezione assi grafico positivi intervalli tabella frazioni"},
 {title:"Funzione inversa",category:"Matematica",path:"matematica/inversa/",description:"Come ricavare l'inversa, controllare l'iniettività e stabilire il dominio.",keywords:"inversa invertibilità invertibile iniettiva iniettività funzione scambio x y inverso"},
 {title:"Composizione di funzioni",category:"Matematica",path:"matematica/composizione/",description:"f∘g e g∘f, sostituzione di funzioni e controllo dei domini.",keywords:"composizione composta funzioni composita sostituzione fg gf g(f(x)) f(g(x))"}
];
function norm(s){return String(s||"").replace(/c\+\+/gi,"cpp").toLocaleLowerCase("it").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim()}
function search(q,scope){let n=norm(q);return topics.filter(t=>(!scope||scope==="all"||norm(t.category)===norm(scope))&&(!n||n.split(/\s+/).every(w=>norm(t.title+" "+t.description+" "+t.category+" "+t.keywords).includes(w))))}
function url(p){return new URL(p,root).href}
function el(tag,cls,txt){const a=document.createElement(tag);if(cls)a.className=cls;if(txt!==undefined)a.textContent=txt;return a}
function makeLink(t,cls){
 const a=el("a",cls);a.href=url(t.path);
 if(cls==="tut-result-link"){a.append(el("b","",t.title),el("small","",t.category+" · "+t.description))}
 else{a.append(el("span","tut-topic-category",t.category),el("b","",t.title),el("small","",t.description))}
 return a;
}
function mountHeader(){
 const header=el("header","tut-sitebar");
 header.innerHTML='<div class="tut-sitebar-inner"><a class="tut-site-brand" data-link="home"><span class="tut-logo" aria-hidden="true">T</span><span>Tutoring<small>Ripasso e materiali di studio</small></span></a><nav class="tut-site-links" aria-label="Materie"><a data-link="informatica">Informatica</a><a data-link="matematica">Matematica</a></nav><div class="tut-site-search"><label class="tut-sr-only" for="tut-site-search-input">Cerca un argomento</label><span class="tut-magnify" aria-hidden="true">⌕</span><input id="tut-site-search-input" type="search" placeholder="Cerca un argomento..." autocomplete="off" aria-label="Cerca un argomento in tutto il sito" aria-controls="tut-site-results" aria-expanded="false"><div class="tut-results" id="tut-site-results" aria-live="polite" hidden></div></div></div>';
 header.querySelector('[data-link="home"]').href=url("");
 header.querySelector('[data-link="informatica"]').href=url("informatica/");
 header.querySelector('[data-link="matematica"]').href=url("matematica/");
 document.body.insertBefore(header,document.body.firstChild);
 const inp=header.querySelector("input"),results=header.querySelector(".tut-results");
 function close(){results.hidden=true;inp.setAttribute("aria-expanded","false")}
 function render(){
  const matches=search(inp.value);
  results.replaceChildren();
  results.appendChild(el("div","tut-search-caption","Argomenti disponibili · "+matches.length));
  if(!matches.length)results.appendChild(el("div","tut-search-empty","Nessun argomento trovato."));
  matches.forEach(t=>results.appendChild(makeLink(t,"tut-result-link")));
  results.hidden=false;inp.setAttribute("aria-expanded","true");
 }
 inp.addEventListener("input",render);
 inp.addEventListener("focus",render);
 inp.addEventListener("keydown",e=>{
   if(e.key==="Escape")close();
   if(e.key==="Enter"){const first=search(inp.value)[0];if(first){window.location.assign(url(first.path))}}
   if(e.key==="ArrowDown" && !results.hidden){e.preventDefault();results.querySelector("a")?.focus()}
 });
 results.addEventListener("keydown",e=>{if(e.key==="Escape"){close();inp.focus()}});
 document.addEventListener("click",e=>{if(!header.querySelector(".tut-site-search").contains(e.target))close()});
}
function catalog(){
 document.querySelectorAll("[data-topic-catalog]").forEach(node=>{
  const scope=node.getAttribute("data-topic-catalog")||"all";
  node.classList.add("tut-catalog");
  const block=el("div","tut-filter-wrap");
  block.innerHTML='<span class="tut-magnify" aria-hidden="true">⌕</span><input class="tut-filter-input" type="search" placeholder="Es. logaritmi, C++, funzioni inverse..." aria-label="Filtra gli argomenti disponibili" autocomplete="off">';
  const input=block.querySelector("input"),status=el("p","tut-filter-status");
  status.setAttribute("aria-live","polite");
  const list=el("div","tut-catalog-list");
  function render(){
    const match=search(input.value,scope);list.replaceChildren();
    match.forEach(t=>list.appendChild(makeLink(t,"tut-topic")));
    if(!match.length)list.appendChild(el("p","tut-no-match","Nessun argomento trovato. Prova un'altra parola."));
    status.textContent=match.length+(match.length===1?" argomento disponibile":" argomenti disponibili");
  }
  input.addEventListener("input",render);
  node.append(block,status,list);render();
 });
}
function filterExisting(){
 document.querySelectorAll("[data-topic-filter-list]").forEach(node=>{
  const selector=node.getAttribute("data-topic-filter-list");
  const list=document.querySelector(selector);if(!list)return;
  const cards=[...list.children].filter(el=>el.matches("a"));
  const input=node.querySelector("input");
  if(!input)return;
  const status=node.querySelector("[data-filter-status]");
  function render(){
   const q=norm(input.value);
   let total=0;
   cards.forEach(c=>{
    const hay=norm(c.textContent+" "+(c.getAttribute("data-keywords")||""));
    const match=!q||q.split(/\s+/).every(w=>hay.includes(w));
    c.hidden=!match;c.classList.add("tut-filterable");if(match)total++;
   });
   if(status)status.textContent=total+(total===1?" argomento trovato":" argomenti trovati");
  }
  input.addEventListener("input",render);render();
 });
}
function run(){mountHeader();catalog();filterExisting()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
})();
