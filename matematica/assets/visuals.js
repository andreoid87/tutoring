
(function(){
"use strict";
const SVG="http://www.w3.org/2000/svg";
const C={good:"#168254",bad:"#c7475a",blue:"#285fc6",muted:"#a9b8cc",axis:"#657b98",grid:"#e6edf5",ink:"#264363",purple:"#7154b8"};
function fmt(n){const v=Math.round(n*100)/100;return (Object.is(v,-0)?0:v).toLocaleString("it-IT",{maximumFractionDigits:2})}
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!==undefined)e.innerHTML=html;return e}
function plotBox(x0,x1,y0,y1,w=660,h=330){
 const l=54,r=w-25,t=24,b=h-36;
 return {x0,x1,y0,y1,w,h,l,r,t,b,X:x=>l+(x-x0)/(x1-x0)*(r-l),Y:y=>b-(y-y0)/(y1-y0)*(b-t),unX:x=>x0+(x-l)/(r-l)*(x1-x0)}
}
function path(fn,lo,hi,p,step=.035){
 let d="",started=false;
 for(let x=lo;x<=hi+1e-7;x+=step){
  const y=fn(Math.min(x,hi));
  if(!Number.isFinite(y)){started=false;continue;}
  d+=(started?"L":"M")+p.X(Math.min(x,hi)).toFixed(2)+" "+p.Y(y).toFixed(2)+" ";
  started=true;
 }
 const y=fn(hi);
 if(Number.isFinite(y))d+="L"+p.X(hi).toFixed(2)+" "+p.Y(y).toFixed(2);
 return d;
}
function frame(p,id,opts={}){
 const {x0,x1,y0,y1,l,r,t,b}=p;let out='<defs><clipPath id="'+id+'"><rect x="'+l+'" y="'+t+'" width="'+(r-l)+'" height="'+(b-t)+'"/></clipPath></defs>';
 out+='<rect x="'+l+'" y="'+t+'" width="'+(r-l)+'" height="'+(b-t)+'" rx="4" fill="#fff"/>';
 const xs=opts.xticks||[-4,-2,0,2,4],ys=opts.yticks||[-4,0,4,8];
 for(const x of xs){if(x<x0||x>x1)continue;const X=p.X(x);out+='<line x1="'+X+'" y1="'+t+'" x2="'+X+'" y2="'+b+'" stroke="'+C.grid+'"/><text x="'+X+'" y="'+(b+17)+'" fill="#8291a8" text-anchor="middle" font-size="12">'+fmt(x)+'</text>'}
 for(const y of ys){if(y<y0||y>y1)continue;const Y=p.Y(y);out+='<line x1="'+l+'" y1="'+Y+'" x2="'+r+'" y2="'+Y+'" stroke="'+C.grid+'"/><text x="'+(l-9)+'" y="'+(Y+4)+'" fill="#8291a8" text-anchor="end" font-size="12">'+fmt(y)+'</text>'}
 if(x0<=0&&x1>=0)out+='<line x1="'+p.X(0)+'" y1="'+t+'" x2="'+p.X(0)+'" y2="'+b+'" stroke="'+C.axis+'" stroke-width="1.5"/>';
 if(y0<=0&&y1>=0)out+='<line x1="'+l+'" y1="'+p.Y(0)+'" x2="'+r+'" y2="'+p.Y(0)+'" stroke="'+C.axis+'" stroke-width="1.5"/>';
 out+='<text x="'+(r-2)+'" y="'+(b-14)+'" text-anchor="end" font-size="12" fill="#566c88">x</text><text x="'+(l+10)+'" y="'+(t+15)+'" font-size="12" fill="#566c88">y</text>';
 return out;
}
function segment(fn,a,b,p,color,width=3,extra=""){
 if(b<=a)return "";return '<path d="'+path(fn,a,b,p)+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="round" '+extra+'/>';
}
function legend(){
 return '<div class="legend"><span class="legend-item"><i class="dot positive"></i> Positiva</span><span class="legend-item"><i class="dot negative"></i> Negativa</span><span class="legend-item"><i class="dot invalid"></i> Fuori dal dominio</span></div>';
}
function signChart(target){
 const host=el("div","math-visual");
 host.innerHTML='<h4>Concordi = +, discordi = −</h4><div class="sign-choices"><div class="sign-choice positive"><b>(−, −) → +</b><span>Concordi</span></div><div class="sign-choice negative"><b>(−, +) → −</b><span>Discordi</span></div><div class="sign-choice negative"><b>(+, −) → −</b><span>Discordi</span></div><div class="sign-choice positive"><b>(+, +) → +</b><span>Concordi</span></div></div><p>Vale sia per il <strong>prodotto</strong> sia per la <strong>frazione</strong> (ma il denominatore non può essere zero).</p><h4>Muovi gli zeri della funzione</h4><p>Nell’esempio f(x) = 0,35 · (x − a) · (x − b), il tratto sotto l’asse x è <strong style="color:#b33d52">rosso</strong>: la funzione è negativa. Trascina i due punti verdi sull’asse x oppure usa i cursori.</p><div class="graph-wrap"><svg viewBox="0 0 660 330" role="group" aria-label="Grafico interattivo della parabola con zeri trascinabili"></svg></div><div class="visual-controls"><label>Primo zero a = <output id="root-a">−2</output><input class="root-slider" data-root="a" aria-label="Primo zero a" type="range" min="-3.3" max="3.3" step="0.1" value="-2"></label><label>Secondo zero b = <output id="root-b">1,5</output><input class="root-slider" data-root="b" aria-label="Secondo zero b" type="range" min="-3.3" max="3.3" step="0.1" value="1.5"></label></div><div class="readout" aria-live="polite"></div>'+legend()+'<p class="visual-caption">Segna l’intervallo rosso come negativo. Fuori dagli zeri la funzione è positiva; sugli zeri vale 0.</p>';
 target.append(host);
 const svg=host.querySelector("svg"),sliders=[...host.querySelectorAll(".root-slider")],read=host.querySelector(".readout");
 const p=plotBox(-4,4,-4.5,9);let a=-2,b=1.5,drag=null;
 const fun=x=>.35*(x-a)*(x-b);
 const y0=()=>fun(0);
 function draw(){
  const fn=x=>fun(x);
  let markup=frame(p,"sgclip",{xticks:[-4,-2,0,2,4],yticks:[-4,0,4,8]});
  markup+='<g clip-path="url(#sgclip)">'+segment(fn,-4,a,p,C.good,4)+segment(fn,a,b,p,C.bad,4)+segment(fn,b,4,p,C.good,4)+'</g>';
  for(const [k,v] of [["a",a],["b",b]]){
   markup+='<circle class="drag-handle" data-drag="'+k+'" tabindex="0" role="button" aria-label="Trascina lo zero '+k+'" cx="'+p.X(v)+'" cy="'+p.Y(0)+'" r="10" fill="'+C.good+'" stroke="white" stroke-width="3"/>';
   markup+='<text x="'+(p.X(v)+9)+'" y="'+(p.Y(0)-14)+'" fill="#186946" font-size="13" font-weight="750">('+fmt(v)+'; 0)</text>';
  }
  markup+='<circle cx="'+p.X(0)+'" cy="'+p.Y(y0())+'" r="7" fill="'+C.purple+'" stroke="white" stroke-width="2.5"/>';
  markup+='<text x="'+(p.X(0)+10)+'" y="'+Math.max(p.t+14,Math.min(p.b-15,p.Y(y0())-10))+'" fill="'+C.purple+'" font-size="13" font-weight="750">(0; '+fmt(y0())+')</text>';
  svg.innerHTML=markup;
  host.querySelector("#root-a").textContent=fmt(a);host.querySelector("#root-b").textContent=fmt(b);
  sliders[0].value=String(a);sliders[1].value=String(b);
  read.innerHTML='<strong>Intersezioni</strong>: A('+fmt(a)+'; 0), B('+fmt(b)+'; 0), C(0; '+fmt(y0())+').<br><strong>f(x) &lt; 0</strong> per '+fmt(a)+' &lt; x &lt; '+fmt(b)+'.';
 }
 function change(which,value){
   if(!Number.isFinite(value))return;
   value=Math.round(value*10)/10;
   if(which==="a")a=Math.min(Math.max(value,-3.3),b-.5);
   else b=Math.max(Math.min(value,3.3),a+.5);
   draw();
 }
 sliders.forEach(sl=>sl.addEventListener("input",()=>change(sl.dataset.root,parseFloat(sl.value))));
 svg.addEventListener("pointerdown",e=>{
  const h=e.target.closest("[data-drag]");if(!h)return;drag=h.dataset.drag;e.preventDefault();svg.setPointerCapture(e.pointerId);
 });
 svg.addEventListener("pointermove",e=>{
  if(!drag)return;
  const r=svg.getBoundingClientRect(),x=p.unX((e.clientX-r.left)/r.width*p.w);
  change(drag,x);
 });
 const end=()=>{drag=null};
 svg.addEventListener("pointerup",end);svg.addEventListener("pointercancel",end);
 svg.addEventListener("keydown",e=>{
  const h=e.target.closest("[data-drag]");if(!h||!["ArrowRight","ArrowLeft"].includes(e.key))return;
  e.preventDefault();change(h.dataset.drag,(h.dataset.drag==="a"?a:b)+(e.key==="ArrowRight"?.1:-.1));
 });
 draw();
}
function miniGraphs(target){
 const host=el("div","math-visual");
 host.innerHTML='<h4>Guarda il segno, non solo la formula</h4><p><strong>Quadrato</strong> e <strong>radice</strong> sono ≥ 0 dove esistono. Il <strong>logaritmo</strong> è negativo tra 0 e 1, vale 0 in 1, positivo oltre 1.</p><div class="mini-grid"></div>'+legend()+'<p class="visual-caption">Le aree tratteggiate sono escluse dal dominio: lì il grafico non esiste. Muovi i cursori per vedere il valore.</p>';
 target.append(host);
 const configs=[
  {title:"y = x²",f:x=>x*x,valid:x=>true,neg:x=>false,zero:0,initial:-1.2},
  {title:"y = √x",f:x=>Math.sqrt(x),valid:x=>x>=0,neg:x=>false,zero:0,initial:1.5},
  {title:"y = ln(x)",f:x=>Math.log(x),valid:x=>x>0,neg:x=>x<1,zero:1,initial:.5}
 ];
 const grid=host.querySelector(".mini-grid");
 configs.forEach((cfg,i)=>{
  const wrap=el("div","mini-card");
  wrap.innerHTML='<strong>'+cfg.title+'</strong><div class="graph-wrap"><svg viewBox="0 0 350 245" role="img" aria-label="Grafico di '+cfg.title+' con segni colorati"></svg></div><label>Valore di x <input type="range" min="-2" max="3" step="0.1" value="'+cfg.initial+'" aria-label="Sposta il punto lungo la funzione '+cfg.title+'"></label><div class="readout" aria-live="polite"></div>';
  grid.append(wrap);
  const svg=wrap.querySelector("svg"),range=wrap.querySelector("input"),read=wrap.querySelector(".readout"),p=plotBox(-2,3,-2.8,5.5,350,245);
  function draw(){
   const x=parseFloat(range.value),v=cfg.valid(x)?cfg.f(x):NaN;
   const id="mini"+i,clip=id+"clip";
   let s=frame(p,clip,{xticks:[-2,-1,0,1,2,3],yticks:[-2,0,2,4]});
   s+='<defs><pattern id="'+id+'hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line y1="0" y2="7" stroke="#d2d9e5" stroke-width="4"/></pattern></defs>';
   if(i>0)s+='<rect x="'+p.l+'" y="'+p.t+'" width="'+(p.X(0)-p.l)+'" height="'+(p.b-p.t)+'" fill="url(#'+id+'hatch)" opacity=".65"/>';
   const start=i===2?.035:i===1?0:-2;
   s+='<g clip-path="url(#'+clip+')">';
   if(i===2){s+=segment(cfg.f,.035,1,p,C.bad,3.5)+segment(cfg.f,1,3,p,C.good,3.5)}
   else{s+=segment(cfg.f,start,3,p,C.good,3.5)}
   s+='</g>';
   const z=cfg.zero;s+='<circle cx="'+p.X(z)+'" cy="'+p.Y(0)+'" r="5" fill="#285fc6" stroke="#fff" stroke-width="2"/>';
   if(Number.isFinite(v)){
    const color=cfg.neg(x)?C.bad:C.good;
    if(p.Y(v)>=p.t&&p.Y(v)<=p.b)s+='<circle cx="'+p.X(x)+'" cy="'+p.Y(v)+'" r="6.5" stroke="white" stroke-width="2" fill="'+color+'"/>';
   }
   svg.innerHTML=s;
   read.textContent=Number.isFinite(v)?"x = "+fmt(x)+" · y = "+fmt(v)+(v===0?" (zero)":v>0?" (positiva)":" (negativa)"):"x = "+fmt(x)+" · fuori dal dominio";
  }
  range.addEventListener("input",draw);draw();
 });
}
function inverseBoxes(target){
 const host=el("div","math-visual");
 host.innerHTML='<h4>La funzione trasforma ingressi in uscite</h4><p>Prendi f(x) = x + 2: ogni ingresso ha una sola uscita. L’inversa scambia le due colonne.</p><div class="branch-controls"><button class="visual-btn" type="button" aria-pressed="false">Inverti le frecce ⇄</button></div><div class="mapping-head"><span class="in-label">Ingresso x</span><span></span><span class="out-label">Uscita y</span></div><div class="mapping-values"></div><div class="readout" aria-live="polite"></div><p class="visual-caption">Un solo risultato per ogni x è obbligatorio. Anche due x diversi possono produrre la stessa y: in quel caso la funzione esiste, ma non ha un’inversa su tutto il dominio.</p>';
 target.append(host);
 const btn=host.querySelector("button"),container=host.querySelector(".mapping-values"),read=host.querySelector(".readout");
 let inverse=false;
 const inp=[-1,0,1,2],out=inp.map(x=>x+2);
 function draw(){
  btn.setAttribute("aria-pressed",inverse?"true":"false");
  btn.textContent=inverse?"Mostra la funzione originale ⇄":"Inverti le frecce ⇄";
  host.querySelector(".in-label").textContent=inverse?"Ingresso dell'inversa (y)":"Ingresso x";
  host.querySelector(".out-label").textContent=inverse?"Uscita dell'inversa (x)":"Uscita y";
  container.innerHTML=inp.map((v,i)=>'<div class="mapping-row"><div class="mapping-box">'+fmt(inverse?out[i]:v)+'</div><div class="mapping-arrow" aria-hidden="true">→</div><div class="mapping-box out">'+fmt(inverse?v:out[i])+'</div></div>').join("");
  read.textContent=inverse?"f⁻¹(y) = y − 2. Per esempio: 3 → 1.":"f(x) = x + 2. Per esempio: 1 → 3.";
 }
 btn.addEventListener("click",()=>{inverse=!inverse;draw()});draw();
}
function branches(target){
 const host=el("div","math-visual");
 host.innerHTML='<h4>f(x) = x²: due ingressi possono avere la stessa uscita</h4><p>Ad esempio, −2 e +2 producono entrambi 4: <strong>−2 → 4 ← +2</strong>. L’inversa non può scegliere due risultati diversi per lo stesso ingresso. Seleziona un solo ramo della parabola.</p><div class="branch-controls" role="group" aria-label="Scegli il ramo della parabola"><button type="button" class="visual-btn" data-branch="both">Tutta la parabola</button><button type="button" class="visual-btn" data-branch="right">Solo x ≥ 0</button><button type="button" class="visual-btn" data-branch="left">Solo x ≤ 0</button></div><div class="dual-graphs"><div><h5>Funzione f(x) = x²</h5><svg viewBox="0 0 370 270" role="img" aria-label="Parabola con ramo selezionato"></svg></div><div><h5>Relazione inversa</h5><svg viewBox="0 0 370 270" role="img" aria-label="Relazione inversa e scelta del ramo"></svg></div></div><div class="readout" aria-live="polite"></div><p class="visual-caption">A sinistra selezioni il ramo di f. A destra compare l’inversa corrispondente, con assi scambiati.</p>';
 target.append(host);
 const buttons=[...host.querySelectorAll("[data-branch]")],svgs=[...host.querySelectorAll("svg")],read=host.querySelector(".readout");
 let mode="both";
 const p=plotBox(-3.2,3.2,-.65,9.2,370,270),q=plotBox(-.65,9.2,-3.2,3.2,370,270);
 function draw(){
  buttons.forEach(b=>b.setAttribute("aria-pressed",b.dataset.branch===mode?"true":"false"));
  let left=frame(p,"parabolaClip",{xticks:[-3,-2,-1,0,1,2,3],yticks:[0,2,4,6,8]});
  const unchosen=mode==="both"?C.blue:"#b5c3d8";
  left+='<g clip-path="url(#parabolaClip)">'+segment(x=>x*x,-3,0,p,mode==="left"?C.good:unchosen,mode==="left"?4:2.5,mode==="right"?'stroke-dasharray="5 5"':'')+
  segment(x=>x*x,0,3,p,mode==="right"?C.good:unchosen,mode==="right"?4:2.5,mode==="left"?'stroke-dasharray="5 5"':'')+'</g>';
  left+='<circle cx="'+p.X(-2)+'" cy="'+p.Y(4)+'" r="5.5" fill="'+(mode==="right"?C.muted:C.blue)+'"/><circle cx="'+p.X(2)+'" cy="'+p.Y(4)+'" r="5.5" fill="'+(mode==="left"?C.muted:C.good)+'"/>';
  left+='<text x="'+(p.X(-2)-6)+'" y="'+(p.Y(4)-11)+'" text-anchor="end" font-size="12" fill="#546c8a">(−2; 4)</text><text x="'+(p.X(2)+8)+'" y="'+(p.Y(4)-11)+'" font-size="12" fill="#546c8a">(2; 4)</text>';
  svgs[0].innerHTML=left;
  let right=frame(q,"inverseClip",{xticks:[0,2,4,6,8],yticks:[-3,-2,0,2,3]});
  right+='<g clip-path="url(#inverseClip)">'+segment(x=>Math.sqrt(x),0,9,q,mode==="left"?C.muted:mode==="right"?C.good:C.bad,mode==="right"?4:2.5,mode==="left"?'stroke-dasharray="5 5"':'')+
  segment(x=>-Math.sqrt(x),0,9,q,mode==="right"?C.muted:mode==="left"?C.good:C.bad,mode==="left"?4:2.5,mode==="right"?'stroke-dasharray="5 5"':'')+'</g>';
  right+='<circle cx="'+q.X(4)+'" cy="'+q.Y(2)+'" r="5.5" fill="'+(mode==="left"?C.muted:C.good)+'"/><circle cx="'+q.X(4)+'" cy="'+q.Y(-2)+'" r="5.5" fill="'+(mode==="right"?C.muted:C.bad)+'"/>';
  svgs[1].innerHTML=right;
  read.innerHTML=mode==="both"?'<strong>Non invertibile su tutti i reali.</strong> L’uscita 4 dovrebbe tornare sia a −2 sia a +2: non sarebbe una funzione.'
    :mode==="right"?'<strong>Ramo destro (x ≥ 0):</strong> f⁻¹(x) = √x per x ≥ 0. Ora ogni uscita della f identifica un solo ingresso.'
    :'<strong>Ramo sinistro (x ≤ 0):</strong> f⁻¹(x) = −√x per x ≥ 0. Anche questo è un ramo valido.';
 }
 buttons.forEach(b=>b.addEventListener("click",()=>{mode=b.dataset.branch;draw()}));draw();
}
function mount(name,element){
 try{
  switch(name){
   case "sign-chart":signChart(element);break;
   case "sign-functions":miniGraphs(element);break;
   case "inverse-mapping":inverseBoxes(element);break;
   case "inverse-branches":branches(element);break;
  }
 }catch(e){const p=el("p","visual-caption");p.textContent="Il grafico interattivo non è disponibile in questo browser.";element.append(p)}
}
window.TutoringMathVisuals={mount};
})();
