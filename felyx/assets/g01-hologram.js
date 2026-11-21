/* C09 / G01 adapted: regular point grid and luminous eye.
 * Keeps Claude's C00 eye geometry; original particle-field.js remains untouched.
 * G01 lifecycle fixed: continuous visibility arbitration, no detached observer. */
(()=>{'use strict';
const anchor=document.querySelector('#eyeHero,#dashboardEye,#assistantEye,#entryEye');
const cv=document.createElement('canvas');cv.id='particleField';cv.setAttribute('aria-hidden','true');document.body.prepend(cv);
const config=window.PalanteerOfficialEyeConfig;
const field=config.fundo, style=field.esferas3D, wave=field.onda3D;
const ctx=cv.getContext('2d');
let w,h,rect,t=0;
const sprite=(color)=>{
 const canvas=document.createElement('canvas'),width=style.spritePreRenderizadoPx;
 canvas.width=canvas.height=width;
 const g=canvas.getContext('2d'), r=width/2;
 const gradient=g.createRadialGradient(r*.72,r*.63,0,r,r,r);
 gradient.addColorStop(0,'#f2f4ec');gradient.addColorStop(.44,color);gradient.addColorStop(1,'#24261b00');
 g.fillStyle=gradient;g.beginPath();g.arc(r,r,r,0,Math.PI*2);g.fill();
 return canvas;
};
const sprites=[sprite(config.direcao_visual.paleta.fundoEsferaVale),sprite(config.direcao_visual.paleta.fundoEsferaCrista)];
function paint(){
 const dpr=Math.min(devicePixelRatio||1,1.5);
 w=innerWidth;h=innerHeight;
 if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){
  cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
 }
 rect=anchor?.getBoundingClientRect();
 const cx=rect?rect.left+rect.width/2:-1000,cy=rect?rect.top+rect.height/2:-1000;
 ctx.clearRect(0,0,w,h);
 const sy=scrollY, step=field.passoPx, dots=[];
 const totalWeight=wave.harmonicas.reduce((sum,harmonic)=>sum+harmonic.peso,0);
 for(let row=Math.floor(sy/step)-1;row<(sy+h)/step+1;row++){
  for(let col=-1;col<w/step+1;col++){
   const x=col*step,y=row*step-sy;
   const waveHeight=wave.harmonicas.reduce((sum,a)=>sum+a.peso*Math.sin(x*a.freqX+(y+sy)*a.freqY+t*a.velocidade),0)/totalWeight;
   const z=waveHeight*wave.amplitudeZPx;
   const phase=x*.011+(y+sy)*.009;
   const radius=style.suavizacaoAtrasDoOlho.raioPx;
   const attenuation=1-(1-style.suavizacaoAtrasDoOlho.fatorMinimoCentro)*Math.exp(-((x-cx)**2+(y-cy)**2)/radius**2);
   dots.push({x:x+field.deslocamentoMaximoPx[0]*Math.sin(phase-t*field.velocidadeAngularRadianosPorSegundo[0]),
    y:y+field.deslocamentoMaximoPx[1]*Math.cos(phase*.8-t*field.velocidadeAngularRadianosPorSegundo[1]), z, waveHeight, attenuation});
  }
 }
 dots.sort((a,b)=>a.z-b.z);
 for(const dot of dots){
  const mix=(dot.waveHeight+1)/2;
  const d=(style.diametroMinPx+mix*(style.diametroMaxPx-style.diametroMinPx))/(1-dot.z/wave.perspectivaFovPx);
  const alpha=field.opacidadeBase*dot.attenuation*(style.opacidadeFatorVale+mix*(style.opacidadeFatorCrista-style.opacidadeFatorVale));
  ctx.globalAlpha=alpha*(1-mix);
  ctx.drawImage(sprites[0],dot.x-d/2,dot.y-d/2,d,d);
  ctx.globalAlpha=alpha*mix;
  ctx.drawImage(sprites[1],dot.x-d/2,dot.y-d/2,d,d);
 }
 ctx.globalAlpha=1;
 if(anchor?.id==='eyeHero'&&rect.bottom>0&&rect.top<h)
  window.paintPalanteerSpheres(ctx,cx,cy,Math.min(rect.width,rect.height)*.43,t);
}
let previous=0;
const wake=window.PalanteerCanvas.register(cv,now=>{
 if(previous)t+=Math.min((now-previous)/1000,.05);
 previous=now;paint();
},{priority:()=>{const r=anchor?.getBoundingClientRect();return !r||r.bottom>0&&r.top<innerHeight?100:0;}});
addEventListener('resize',wake);if(anchor)new ResizeObserver(wake).observe(anchor);
document.fonts.ready.then(wake);
})();
