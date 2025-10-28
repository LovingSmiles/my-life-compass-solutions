// js/spiritual-audio.js
(function(){
  const ctxState = { ctx:null, master:null, padGain:null, shimmerGain:null, filter:null, raf:0, nodes:[] };
  const clamp = (v, lo, hi)=> Math.max(lo, Math.min(hi, v));

  function createContext(){
    if (ctxState.ctx) return ctxState.ctx;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain(); master.gain.value = 0.25; master.connect(ctx.destination);

    // Slow-breathing lowpass filter for warmth
    const filter = ctx.createBiquadFilter(); filter.type='lowpass'; filter.frequency.value = 1200; filter.Q.value = 0.6;
    filter.connect(master);

    // Pad layer
    const padGain = ctx.createGain(); padGain.gain.value = 0.5; padGain.connect(filter);

    // Shimmer layer
    const shimmerGain = ctx.createGain(); shimmerGain.gain.value = 0.12; shimmerGain.connect(master);

    ctxState.ctx = ctx;
    ctxState.master = master;
    ctxState.padGain = padGain;
    ctxState.shimmerGain = shimmerGain;
    ctxState.filter = filter;
    return ctx;
  }

  function makeSine(freq, gainNode){
    const osc = ctxState.ctx.createOscillator();
    const g   = ctxState.ctx.createGain();
    g.gain.value = 0.0;
    osc.frequency.value = freq;
    osc.connect(g); g.connect(gainNode);
    osc.start();
    return {osc, g};
  }

  function schedulePad(){
    const root = 196; // G3 base
    const freqs = [root, root*5/4, root*3/2, root*2, root*15/8]; // G B D G B (gentle)
    freqs.forEach((f,i)=>{
      const o = makeSine(f, ctxState.padGain);
      ctxState.nodes.push(o);
      const now = ctxState.ctx.currentTime;
      const g = o.g.gain;
      // fade in and out staggered
      g.cancelScheduledValues(now);
      g.setValueAtTime(0, now);
      g.linearRampToValueAtTime(0.06 + i*0.012, now + 3 + i*0.5);
      g.linearRampToValueAtTime(0.04 + i*0.008, now + 12 + i*0.5);
    });

    // light shimmer (random tinkles)
    function shimmerTick(){
      if(!ctxState.ctx) return;
      const t = ctxState.ctx.currentTime;
      const o = ctxState.ctx.createOscillator();
      const g = ctxState.ctx.createGain();
      const f = 1000 + Math.random()*1500;
      o.type = 'triangle';
      o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.02, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5 + Math.random()*0.4);
      o.connect(g); g.connect(ctxState.shimmerGain);
      o.start(t);
      o.stop(t + 0.8);
      setTimeout(()=>{ try{o.disconnect(); g.disconnect();}catch(e){} }, 1200);
      if (ctxState.ctx) ctxState.raf = setTimeout(shimmerTick, 1200 + Math.random()*1200);
    }
    ctxState.raf = setTimeout(shimmerTick, 1000);
  }

  function startBreath(){
    let t0 = performance.now();
    function loop(now){
      if(!ctxState.ctx) return;
      const breathe = ctxState._breathe ?? 0.4; // 0..1
      const speed = 0.05 + 0.25*breathe;       // slower when lower
      const depth = 200 + 800*breathe;         // more range when higher
      const base  = 800 + 600*(ctxState._warmth ?? 0.6);
      const cut   = base + Math.sin(now*0.001*speed)*depth;
      ctxState.filter.frequency.value = clamp(cut, 200, 4000);
      ctxState.raf = requestAnimationFrame(loop);
    }
    ctxState.raf = requestAnimationFrame(loop);
  }

  async function start(){
    if (ctxState.ctx) return;
    createContext();
    schedulePad();
    startBreath();
  }
  async function stop(){
    if (!ctxState.ctx) return;
    try {
      ctxState.nodes.forEach(n=>{ try{ n.osc.stop(); n.osc.disconnect(); n.g.disconnect(); }catch(e){} });
      ctxState.nodes = [];
      if (ctxState.raf) cancelAnimationFrame(ctxState.raf);
      ctxState.raf = 0;
      await ctxState.ctx.close();
    } catch(e){}
    ctxState.ctx = null; ctxState.master=null; ctxState.padGain=null; ctxState.shimmerGain=null; ctxState.filter=null;
  }

  function setVolume(v){ if (ctxState.master) ctxState.master.gain.value = clamp(v, 0, 1); }
  function setWarmth(v){ ctxState._warmth = clamp(v, 0, 1); }
  function setBreathe(v){ ctxState._breathe = clamp(v, 0, 1); }

  window.MCLS_AMBIENT = { start, stop, setVolume, setWarmth, setBreathe };
})();
