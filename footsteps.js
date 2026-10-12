'use strict';
(() => {
  const canvas = document.querySelector('#paw-trail'), ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!ctx) return;
  const stamp = document.createElement('canvas'); stamp.width = 80; stamp.height = 92;
  const ink = stamp.getContext('2d');
  // Four toe pads and one soft triangular heel, distressed like a dry paint stamp.
  ink.fillStyle = '#536c61';
  [[13,36,9,12,-.4],[30,18,9,13,-.13],[51,18,9,13,.13],[68,36,9,12,.4]].forEach(([x,y,rx,ry,a])=>{
    ink.beginPath();ink.ellipse(x,y,rx,ry,a,0,Math.PI*2);ink.fill();
  });
  ink.beginPath();ink.moveTo(40,38);ink.bezierCurveTo(27,37,9,65,18,76);ink.bezierCurveTo(24,85,32,78,40,78);ink.bezierCurveTo(49,78,59,85,65,75);ink.bezierCurveTo(74,64,54,37,40,38);ink.fill();
  let seed=1463;
  function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  ink.globalCompositeOperation='destination-out';
  for(let i=0;i<420;i++){ink.fillStyle=`rgba(0,0,0,${.15+random()*.7})`;ink.fillRect(random()*80,random()*92,.5+random()*1.4,1+random()*3);}
  let width=0,height=0,frame=0,lastY=scrollY,distance=0,step=0,marks=[];
  const lifespan=13500;
  function resize(){
    width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);request();
  }
  function draw(now){
    frame=0;ctx.clearRect(0,0,width,height);
    marks=marks.filter(mark=>now-mark.born<lifespan);
    for(const mark of marks){
      const age=now-mark.born,y=mark.y-scrollY;
      if(y< -50||y>height+50)continue;
      const x=width<760?width-15+(mark.side?4:-4):width*.033+(mark.side?10:-10);
      const size=width<760?16:23;
      ctx.save();ctx.translate(x,y);ctx.rotate(mark.angle);
      ctx.globalAlpha=.46*Math.min(1,age/140)*Math.min(1,(lifespan-age)/2500);
      ctx.drawImage(stamp,-size/2,-size*.575,size,size*1.15);ctx.restore();
    }
    if(marks.length&&!document.hidden&&!reduced.matches)request();
  }
  function request(){if(!frame)frame=requestAnimationFrame(draw);}
  function scroll(){
    const delta=window.scrollY-lastY;lastY=window.scrollY;
    if(reduced.matches||!document.querySelector('#entrance').hidden){distance=0;return;}
    distance+=Math.abs(delta);
    if(distance<76){if(marks.length)request();return;}
    // Keep normal scrolling. Long anchor jumps add at most two marks per event.
    const count=Math.min(2,Math.floor(distance/76));distance%=76;
    for(let i=0;i<count;i++){
      const side=step++%2,clientY=height*(delta>0?.76:.28)+i*35;
      marks.push({side,y:window.scrollY+clientY,angle:(delta>0?Math.PI:0)+(side?.15:-.15),born:performance.now()});
    }
    marks=marks.slice(-28);canvas.dataset.steps=String(step);request();
  }
  window.addEventListener('resize',resize);
  window.addEventListener('scroll',scroll,{passive:true});
  document.addEventListener('garden-entered',()=>{lastY=window.scrollY;distance=0;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else request();});
  reduced.addEventListener('change',()=>{marks=[];distance=0;cancelAnimationFrame(frame);frame=0;ctx.clearRect(0,0,width,height);});
  resize();
})();
