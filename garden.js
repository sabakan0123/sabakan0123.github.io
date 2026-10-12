'use strict';
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  // No mode switches: the painting responds briefly to touch or pointer movement.
  let activeUntil = 0;
  const wake = () => { activeUntil = performance.now() + 4000; };
  document.addEventListener('garden-entered', wake);
  // A real, subdivided WebGL relief mesh: the painting bends in 3D, while
  // a restrained fragment shader moves only the pond's reflected light.
  const canvas = document.querySelector('#garden-canvas');
  const garden = document.querySelector('#garden');
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
  if (!gl) { return; }
  const vertexSource = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    uniform vec2 uPointer;
    void main() {
      vUv = aPosition * .5 + .5;
      float island = exp(-pow((aPosition.x-.28)*2.5,2.)-pow((aPosition.y+.1)*2.8,2.));
      float foreground = pow(max(0.,-aPosition.y),2.);
      float depth = island*.3 + foreground*.48;
      vec3 p = vec3(aPosition*1.035, depth);
      float yaw=uPointer.x*.045, pitch=uPointer.y*.024;
      p.xz=mat2(cos(yaw),-sin(yaw),sin(yaw),cos(yaw))*p.xz;
      p.yz=mat2(cos(pitch),-sin(pitch),sin(pitch),cos(pitch))*p.yz;
      gl_Position=vec4(p.xy,0.,1.-p.z*.035);
    }`;
  const fragmentSource = `
    precision mediump float;
    varying vec2 vUv;
    uniform sampler2D uImage;
    uniform float uTime;
    uniform vec2 uCrop;
    uniform vec3 uRipple;
    void main() {
      vec2 uv=(vUv-.5)*uCrop+.5;
      float water=1.-smoothstep(.40,.54,uv.y);
      uv.x+=sin(uv.y*110.+uTime*.7)*.00125*water;
      uv.y+=sin(uv.x*48.+uTime*.42)*.00075*water;
      vec2 delta=vUv-uRipple.xy;
      float dist=length(delta);
      float age=uTime-uRipple.z;
      float ripple=sin(dist*90.-age*7.)*exp(-dist*5.)*max(0.,1.-age/5.)*step(0.,age);
      uv+=delta*ripple*.018*water;
      gl_FragColor=texture2D(uImage,clamp(uv,.001,.999));
    }`;
  function compile(type, src) {
    const shader = gl.createShader(type); gl.shaderSource(shader, src); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Garden shader unavailable');
    return shader;
  }
  let program;
  try {
    program=gl.createProgram(); gl.attachShader(program,compile(gl.VERTEX_SHADER,vertexSource)); gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragmentSource)); gl.linkProgram(program);
    if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error('Garden program unavailable');
  } catch (_) {  return; }
  gl.useProgram(program);
  const points=[]; const nx=64, ny=48;
  for(let y=0;y<ny;y++) for(let x=0;x<nx;x++) {
    const x0=x/nx*2-1, x1=(x+1)/nx*2-1, y0=y/ny*2-1, y1=(y+1)/ny*2-1;
    points.push(x0,y0,x1,y0,x0,y1,x0,y1,x1,y0,x1,y1);
  }
  const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(program,'aPosition'); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const uTime=gl.getUniformLocation(program,'uTime'), uPointer=gl.getUniformLocation(program,'uPointer'), uCrop=gl.getUniformLocation(program,'uCrop'), uRipple=gl.getUniformLocation(program,'uRipple');
  gl.uniform3f(uRipple,.6,.2,-100);
  const texture=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,texture); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const img=new Image(); let ready=false, inView=true, lost=false, t=0, last=0, px=0,py=0,tx=0,ty=0,dirty=true;
  reduced.addEventListener('change', () => { paused = reduced.matches; dirty = true; });
  function resize(){
    const rect=garden.getBoundingClientRect(); const dpr=Math.min(devicePixelRatio || 1,1.5);
    canvas.width=Math.round(rect.width*dpr); canvas.height=Math.round(rect.height*dpr); gl.viewport(0,0,canvas.width,canvas.height);
    const ratio=rect.width/rect.height, imageRatio=1.5;
    gl.uniform2f(uCrop,Math.min(1,ratio/imageRatio),Math.min(1,imageRatio/ratio)); dirty=true;
  }
  new ResizeObserver(resize).observe(garden);
  new IntersectionObserver(([entry]) => {inView=entry.isIntersecting;dirty=true;},{threshold:0}).observe(garden);
  img.onload=()=>{gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);ready=true;resize();garden.classList.add('ready');};
  img.onerror=()=>{};
  img.src='assets/watergarden-shorthair.webp';
  document.querySelector('.hero').addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;wake();const r=garden.getBoundingClientRect();tx=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));ty=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1));});
  document.querySelector('.hero').addEventListener('pointerleave',()=>{tx=ty=0;});
  function ripple(x=.62,y=.22){if(paused)return;wake();gl.uniform3f(uRipple,x,y,t);dirty=true;}
  garden.addEventListener('pointerdown',e=>{const r=garden.getBoundingClientRect();ripple((e.clientX-r.left)/r.width,1-(e.clientY-r.top)/r.height);});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;garden.classList.remove('ready');});
  function frame(now){
    requestAnimationFrame(frame);
    const dt=Math.min((now-last)/1000,.05);last=now;
    if(!ready||lost||!inView||document.hidden)return;
    if(!paused && now < activeUntil){t+=dt;px+=(tx-px)*.035;py+=(ty-py)*.035;dirty=true;}
    if(!dirty)return;
    gl.uniform1f(uTime,t);gl.uniform2f(uPointer,px,py);gl.drawArrays(gl.TRIANGLES,0,points.length/2);dirty=false;
  }
  requestAnimationFrame(frame);
})();
