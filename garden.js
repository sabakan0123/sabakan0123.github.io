'use strict';
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const vertex = `attribute vec2 aPosition; varying vec2 vUv; void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;
  const fragment = `
    precision mediump float;
    varying vec2 vUv;
    uniform sampler2D uImage;
    uniform vec2 uCrop;
    uniform float uAspect;
    uniform float uTime;
    uniform vec3 uRipples[4];
    void main(){
      vec2 normal=vec2(0.); float crest=0.;
      for(int i=0;i<4;i++){
        float age=uTime-uRipples[i].z;
        vec2 delta=(vUv-uRipples[i].xy)*vec2(uAspect,1.);
        float d=max(length(delta),.001);
        float front=d-age*.27;
        float envelope=exp(-pow(front/.085,2.))*exp(-age*.85)*step(0.,age)*step(age,3.8);
        float phase=front*100.;
        float wave=sin(phase)*envelope;
        normal+=delta/d*cos(phase)*envelope*.19;
        crest+=wave;
      }
      vec2 uv=(vUv-.5)*uCrop+.5;
      vec2 refraction=normal/vec2(uAspect,1.)*.06;
      vec3 color=texture2D(uImage,clamp(uv+refraction,.001,.999)).rgb;
      // A moving highlight and shadow on the refracted brushwork, like raised water.
      float light=dot(normal,normalize(vec2(-.65,.8)));
      color+=light*.46+max(0.,crest)*.027;
      gl_FragColor=vec4(color,1.);
    }`;
  document.querySelectorAll('[data-water-image]').forEach(surface => {
    const canvas = surface.querySelector('canvas');
    const gl = canvas.getContext('webgl', {alpha:false,antialias:false,powerPreference:'low-power'});
    if (!gl) return;
    function shader(type, source) {
      const s=gl.createShader(type); gl.shaderSource(s,source); gl.compileShader(s);
      if (!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error('Water shader unavailable');
      return s;
    }
    let program;
    try {
      program=gl.createProgram(); gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex)); gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment)); gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
    } catch (_) {return;}
    gl.useProgram(program);
    const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'aPosition'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const uTime=gl.getUniformLocation(program,'uTime'), uCrop=gl.getUniformLocation(program,'uCrop'), uAspect=gl.getUniformLocation(program,'uAspect'), uRipples=gl.getUniformLocation(program,'uRipples[0]');
    const texture=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    const image=new Image(), ripples=new Float32Array([.5,.5,-100,.5,.5,-100,.5,.5,-100,.5,.5,-100]);
    let ready=false, lost=false, visible=true, frameId=0, until=0, next=0;
    function render(now) {
      frameId=0;
      if(!ready||lost||!visible||document.hidden)return;
      gl.uniform1f(uTime,now/1000); gl.uniform3fv(uRipples,ripples); gl.drawArrays(gl.TRIANGLES,0,6); surface.classList.add('ready');
      if(now<until&&!reduced.matches)frameId=requestAnimationFrame(render);
    }
    function request(){if(!frameId)frameId=requestAnimationFrame(render);}
    function resize(){
      const r=surface.getBoundingClientRect(), dpr=Math.min(devicePixelRatio||1,1.5);
      canvas.width=Math.max(1,Math.round(r.width*dpr)); canvas.height=Math.max(1,Math.round(r.height*dpr)); gl.viewport(0,0,canvas.width,canvas.height);
      const ratio=r.width/r.height, imageRatio=image.naturalWidth/image.naturalHeight||2.15;
      gl.uniform2f(uCrop,Math.min(1,ratio/imageRatio),Math.min(1,imageRatio/ratio)); gl.uniform1f(uAspect,ratio);request();
    }
    new ResizeObserver(resize).observe(surface);
    new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)request();}).observe(surface);
    image.onload=()=>{gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);ready=true;resize();};
    image.src=surface.dataset.waterImage;
    function ripple(x,y){
      if(reduced.matches||!ready||lost)return;
      const now=performance.now(); ripples.set([x,y,now/1000],next*3); next=(next+1)%4; until=now+4000;
      surface.dataset.rippleCount=String(Number(surface.dataset.rippleCount||0)+1); request();
    }
    const target=surface.closest('.hero')||surface;
    target.addEventListener('pointerdown',event=>{
      const r=surface.getBoundingClientRect();
      if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)return;
      ripple((event.clientX-r.left)/r.width,1-(event.clientY-r.top)/r.height);
    },{passive:true});
    surface.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();ripple(.5,.5);}});
    reduced.addEventListener('change',()=>{if(reduced.matches){for(let i=0;i<4;i++)ripples[i*3+2]=-100;until=0;request();}});
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(frameId);surface.classList.remove('ready');});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)request();});
  });

  // Keep each original text node accessible; the painted copies are decorative.
  // Each glyph is uncovered by a ragged brush-shaped mask, in reading order.
  const painted = [];
  function preparePaint(){
    if(reduced.matches || !('IntersectionObserver' in window)) return;
    const roots=document.querySelectorAll('.hero-copy, .canvas-gallery');
    roots.forEach(root=>{
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
        return node.textContent.trim() && !node.parentElement.closest('svg, canvas, .paint-run') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }});
      const textNodes=[]; while(walker.nextNode()) textNodes.push(walker.currentNode);
      textNodes.forEach(text=>{
        const run=document.createElement('span'); run.className='paint-run paint-pending';
        const source=document.createElement('span'); source.className='paint-source'; source.textContent=text.textContent; run.append(source);
        const visible=document.createElement('span'); visible.setAttribute('aria-hidden','true');
        let index=0;
        // Keep Latin words together while allowing Japanese to wrap naturally.
        text.textContent.split(/([A-Za-z0-9_./@×—-]+|\s+)/).filter(Boolean).forEach(part=>{
          if(/^\s+$/.test(part)){visible.append(document.createTextNode(part));return;}
          const word=document.createElement('span'); word.className=/^[A-Za-z0-9_./@×—-]+$/.test(part)?'paint-word':'paint-phrase';
          Array.from(part).forEach(char=>{
            const glyph=document.createElement('span'); glyph.className='paint-glyph'; glyph.textContent=char;
            glyph.style.setProperty('--ink-delay',`${Math.min(index++ * 24,1300)}ms`); word.append(glyph);
          });visible.append(word);
        });
        run.append(visible);text.replaceWith(run);painted.push(run);
      });
    });
  }
  preparePaint();
  function revealText(){
    if(!painted.length)return;
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.replace('paint-pending','paint-drawing');observer.unobserve(entry.target);}
    }),{threshold:0,rootMargin:'0px 0px -24px 0px'});
    painted.forEach(node=>observer.observe(node));
    // Keyboard focus immediately exposes a link, even before its scroll reveal.
    document.addEventListener('focusin',event=>event.target.querySelectorAll('.paint-pending').forEach(node=>node.classList.replace('paint-pending','paint-drawing')));
    reduced.addEventListener('change',event=>{if(event.matches){painted.forEach(node=>node.classList.remove('paint-pending','paint-drawing'));observer.disconnect();}});
  }
  if(document.querySelector('#entrance').hidden)revealText();
  else document.addEventListener('garden-entered',revealText,{once:true});
})();
