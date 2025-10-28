// lifecompass.js
document.addEventListener("DOMContentLoaded", () => {

    // Background color picker (shared)
    const picker = document.getElementById("bgPicker");
    if (picker) {
      const key = "userBgColor";
      const saved = localStorage.getItem(key);
      if (saved) document.body.style.backgroundColor = saved;
      picker.addEventListener("input", e => {
        const color = e.target.value;
        document.body.style.backgroundColor = color;
        localStorage.setItem(key, color);
      });
    }
  
    // Fireworks shared function
    window.fireworks = function() {
      const c = document.getElementById("fx");
      if (!c) return;
      const ctx = c.getContext("2d");
      const DPR = window.devicePixelRatio || 1;
      c.width = innerWidth * DPR;
      c.height = innerHeight * DPR;
      ctx.scale(DPR, DPR);
      c.style.display = "block";
      const particles = [];
      const colors = ["#ff5252","#ffd452","#7cfc89","#8ab6ff","#f48fb1","#fff176","#b39ddb"];
      const gravity = 0.05;
  
      function spawn(x,y){
        for(let i=0;i<80;i++){
          const a = Math.random()*Math.PI*2;
          const s = Math.random()*5+2;
          particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:80,color:colors[Math.random()*colors.length|0]});
        }
      }
      spawn(innerWidth/2,innerHeight/3);
      function tick(){
        ctx.clearRect(0,0,innerWidth,innerHeight);
        particles.forEach(p=>{
          p.vy+=gravity; p.x+=p.vx; p.y+=p.vy; p.life--;
          ctx.globalAlpha = Math.max(p.life/80,0);
          ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.arc(p.x,p.y,2,0,Math.PI*2); ctx.fill();
        });
        for(let i=particles.length-1;i>=0;i--) if(particles[i].life<=0) particles.splice(i,1);
        if(particles.length) requestAnimationFrame(tick); else c.style.display="none";
      }
      tick();
    };
  
    // Any other universal site-wide logic can go here
  });