// Formas do Leonardo desenhadas em traço (300x300) e amostradas em pontos
window.LeoFormas=(function(){
  const S=300;
  function amostrar(desenho,N,lw){
    const cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d');
    g.strokeStyle='#fff';g.fillStyle='#fff';g.lineWidth=lw||2.4;g.lineCap='round';g.lineJoin='round';desenho(g);
    const d=g.getImageData(0,0,S,S).data,px=[];
    for(let y=0;y<S;y++)for(let x=0;x<S;x++)if(d[(y*S+x)*4+3]>110)px.push([x,y]);
    const out=[];for(let i=0;i<N;i++){const p=px[(Math.random()*px.length)|0];out.push({x:(p[0]+Math.random()-.5)/S*2-1,y:(p[1]+Math.random()-.5)/S*2-1,z:(Math.random()-.5)*.08});}
    out.sort((a,b)=>a.y-b.y||a.x-b.x);return out;
  }
  const L=(g,pts)=>{g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.stroke();};
  const Q=(g,a)=>{g.beginPath();g.moveTo(a[0],a[1]);for(let i=2;i<a.length;i+=4)g.quadraticCurveTo(a[i],a[i+1],a[i+2],a[i+3]);g.stroke();};
  function vitruviano(g){
    const cx=150;
    g.beginPath();g.arc(cx,158,128,0,7);g.stroke();               // círculo
    g.strokeRect(46,62,208,208);                                  // quadrado
    g.beginPath();g.ellipse(cx,84,15,19,0,0,7);g.stroke();         // cabeça
    g.lineWidth=3.4;
    L(g,[cx,103,cx,112]);                                         // pescoço
    Q(g,[cx-24,116,cx-28,150,cx-18,178, cx-12,196,cx,200]); Q(g,[cx+24,116,cx+28,150,cx+18,178, cx+12,196,cx+2,200]); // tronco
    L(g,[cx-24,116,cx+24,116]);
    L(g,[46,118,cx-24,116]); L(g,[cx+24,116,254,118]);            // braços abertos
    L(g,[cx-24,114,58,62]); L(g,[cx+24,114,242,62]);              // braços erguidos
    L(g,[cx-10,200,cx-14,268]); L(g,[cx+10,200,cx+14,268]);       // pernas juntas
    L(g,[cx-8,200,78,272]); L(g,[cx+8,200,222,272]);              // pernas abertas
    g.lineWidth=2;L(g,[cx-12,98,cx-4,100]);
  }
  function monalisa(g){
    const cx=150;
    g.lineWidth=2.6;
    g.beginPath();g.ellipse(cx,92,30,40,0,0,7);g.stroke();             // rosto
    Q(g,[cx,50, cx-36,48,cx-44,92, cx-50,140,cx-70,160]);               // cabelo esq
    Q(g,[cx,50, cx+36,48,cx+44,92, cx+50,140,cx+66,158]);               // cabelo dir
    L(g,[cx,52,cx,60]);                                                // risca do meio
    Q(g,[cx-14,86,cx-9,82,cx-4,86]);Q(g,[cx+4,86,cx+9,82,cx+14,86]);   // olhos
    Q(g,[cx-1,92,cx-3,102,cx+2,104]);                                  // nariz
    Q(g,[cx-10,114,cx,118,cx+11,112]);                                 // sorriso
    L(g,[cx-14,130,cx-16,150]);L(g,[cx+14,130,cx+16,150]);             // pescoço
    Q(g,[cx-70,160, cx-30,150,cx,176, cx+30,150,cx+66,158]);            // decote
    Q(g,[cx-70,160, cx-100,180,cx-104,250]);Q(g,[cx+66,158,cx+98,180,cx+104,250]); // ombros e braços
    Q(g,[cx-104,250, cx-60,236,cx-20,250]);                            // braço esq cruzado
    Q(g,[cx-30,262, cx+20,236,cx+70,246]);                             // braço dir cruzado
    g.beginPath();g.ellipse(cx+60,256,18,9,-.2,0,7);g.stroke();        // mão
    g.beginPath();g.ellipse(cx+30,246,16,8,-.3,0,7);g.stroke();
    g.lineWidth=1.4;Q(g,[8,120,40,108,70,124]);Q(g,[230,118,262,104,292,116]); // paisagem
    Q(g,[14,150,40,140,60,160]);Q(g,[240,150,270,138,292,152]);
  }
  function asas(g){ // máquina voadora (ornitóptero), visto de frente
    const cx=150;g.lineWidth=2.4;
    for(const s of[-1,1]){
      Q(g,[cx,120, cx+s*70,70,cx+s*140,92]);                            // borda de ataque
      Q(g,[cx+s*140,92, cx+s*120,140,cx+s*100,142, cx+s*84,170,cx+s*60,160, cx+s*40,180,cx+s*10,160]); // borda recortada
      for(let k=1;k<5;k++){const f=k/5;L(g,[cx+s*8,124,cx+s*(30+f*105),88+f*f*30+(1-f)*10, ]);} // costelas
    }
    g.beginPath();g.ellipse(cx,150,9,30,0,0,7);g.stroke();
    L(g,[cx,180,cx,230]);L(g,[cx-30,230,cx+30,230]);
  }
  // parafuso aéreo: pontos 3D gerados, girados no desenho
  function parafuso(N){
    const o=[];for(let i=0;i<N;i++){const r=Math.random();
      if(r<.72){const a=Math.random()*Math.PI*2*1.15,R=.18+.62*Math.random(),h=-.55+a/(Math.PI*2*1.15)*.75;
        if(Math.random()<.5){o.push({x:Math.cos(a)*.8,z:Math.sin(a)*.8,y:h});}else o.push({x:Math.cos(a)*R,z:Math.sin(a)*R,y:h});}
      else if(r<.84){o.push({x:(Math.random()-.5)*.03,z:0,y:-.6+Math.random()*1.2});}
      else{const a=Math.random()*6.283;o.push({x:Math.cos(a)*.62,z:Math.sin(a)*.62,y:.62+(Math.random()-.5)*.03});}}
    return o;
  }
  function gerar(N){return{vitruviano:amostrar(vitruviano,N),monalisa:amostrar(monalisa,N),asas:amostrar(asas,N),parafuso:parafuso(N)};}
  return{gerar,desenhos:{vitruviano,monalisa,asas},S};
})();
