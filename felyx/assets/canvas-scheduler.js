/* C09: one canvas render per frame, including static invalidations. */
(()=>{'use strict';
const jobs=[],motion=matchMedia('(prefers-reduced-motion: reduce)');
let raf=0,last=0,active=null;
function area(el){const r=el.getBoundingClientRect();return Math.max(0,Math.min(innerWidth,r.right)-Math.max(0,r.left))*Math.max(0,Math.min(innerHeight,r.bottom)-Math.max(0,r.top));}
function wake(){if(!raf&&!document.hidden)raf=requestAnimationFrame(tick);}
function tick(now){raf=0;if(document.hidden){last=0;return;}
 const visible=jobs.filter(j=>area(j.target)>0);
 visible.sort((a,b)=>b.priority()-a.priority());
 const chosen=visible[0],job=visible.find(j=>j.dirty)||(!motion.matches?chosen:null);
 if(job){const dt=!motion.matches&&active===job&&last?Math.min(now-last,50):0;job.time+=dt;job.draw(job.time);job.dirty=false;job.frames++;if(job===chosen&&!motion.matches)job.animated++;active=job;}
 last=now;
 if(visible.some(j=>j.dirty)||(!motion.matches&&chosen))wake();
}
function invalidate(){jobs.forEach(j=>j.dirty=true);wake();}
const io=new IntersectionObserver(wake);
window.PalanteerCanvas={
 register(canvas,draw,{target=canvas,priority=()=>10}={}){
  const j={canvas,target,draw,priority,dirty:true,frames:0,animated:0,time:performance.now()};jobs.push(j);io.observe(target);wake();
  return ()=>{j.dirty=true;wake();};
 },
 stats:()=>({active:document.hidden||motion.matches?null:active?.canvas.id,frames:Object.fromEntries(jobs.map(j=>[j.canvas.id,j.frames])),animated:Object.fromEntries(jobs.map(j=>[j.canvas.id,j.animated]))})
};
addEventListener('scroll',()=>{const bg=jobs.find(j=>j.canvas.id==='particleField');if(bg)bg.dirty=true;wake();},{passive:true});addEventListener('resize',invalidate);
motion.addEventListener('change',invalidate);
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);raf=0;last=0;active=null;if(!document.hidden)invalidate();});
})();
