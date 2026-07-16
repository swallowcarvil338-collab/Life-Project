/* ---------- 13. CHART ---------- */
const CHART_MODES = ['XP','Skill','Reading','Trading','Books'];
let activeChart = 'XP';
function renderChartTabs(){
  document.getElementById('chartTabs').innerHTML = CHART_MODES.map(m=>
    `<button class="chip ${m===activeChart?'active':''}" onclick="setChart('${m}')">${m}</button>`
  ).join('');
}
function setChart(m){ activeChart = m; renderChartTabs(); drawChart(); }

function drawChart(){
  const canvas = document.getElementById('mainChart');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || canvas.parentElement.clientWidth-48;
  const h = 240;
  canvas.width = w*dpr; canvas.height = h*dpr;
  canvas.style.width = w+'px'; canvas.style.height = h+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,w,h);

  let dataPoints = [];
  if(activeChart==='XP'){
    dataPoints = state.history.map(h=>h.totalXP);
    if(dataPoints.length===0) dataPoints=[0];
  } else if(activeChart==='Skill'){
    dataPoints = SKILL_LIST.map(k=>state.skills[k].level);
  } else if(activeChart==='Reading'){
    dataPoints = [state.books.filter(b=>b.status==='Selesai').length];
  } else if(activeChart==='Trading'){
    dataPoints = state.trades.map(t=> (parseFloat(t.profit)||0)-(parseFloat(t.loss)||0));
    if(dataPoints.length===0) dataPoints=[0];
  } else if(activeChart==='Books'){
    const cats = {};
    state.books.forEach(b=>{cats[b.category||'Lainnya']=(cats[b.category||'Lainnya']||0)+1;});
    dataPoints = Object.values(cats);
    if(dataPoints.length===0) dataPoints=[0];
  }

  const max = Math.max(...dataPoints, 1);
  const min = Math.min(...dataPoints, 0);
  const pad = 20;
  const usableW = w - pad*2;
  const usableH = h - pad*2;

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  for(let i=0;i<=4;i++){
    const y = pad + usableH*i/4;
    ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(w-pad,y); ctx.stroke();
  }

  if(activeChart==='Skill' || activeChart==='Books'){
    const barW = usableW/dataPoints.length*0.6;
    const gap = usableW/dataPoints.length;
    dataPoints.forEach((v,i)=>{
      const barH = ((v-min)/(max-min||1))*usableH;
      const x = pad + gap*i + (gap-barW)/2;
      const y = h-pad-barH;
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x,y,barW,barH,4) : ctx.rect(x,y,barW,barH);
      ctx.fill();
    });
  } else {
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    dataPoints.forEach((v,i)=>{
      const x = pad + (dataPoints.length<=1?0:usableW*i/(dataPoints.length-1));
      const y = h-pad-((v-min)/(max-min||1))*usableH;
      i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    });
    ctx.stroke();
    ctx.fillStyle='rgba(56,189,248,0.12)';
    ctx.lineTo(w-pad,h-pad); ctx.lineTo(pad,h-pad); ctx.closePath(); ctx.fill();
  }
}
window.addEventListener('resize', ()=> drawChart());

