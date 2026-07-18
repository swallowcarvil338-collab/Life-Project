/* ---------- 30. WEEKLY / MONTHLY RECAP ---------- */
let recapPeriod = 'week';

function setRecapPeriod(p){
  recapPeriod = p;
  document.getElementById('recapChipWeek').classList.toggle('active', p==='week');
  document.getElementById('recapChipMonth').classList.toggle('active', p==='month');
  renderRecap();
}

function xpTotalAtOrBefore(dateStr){
  const entries = state.history.filter(h=>h.date<=dateStr).sort((a,b)=>a.date.localeCompare(b.date));
  return entries.length ? entries[entries.length-1].totalXP : 0;
}

function renderRecap(){
  const grid = document.getElementById('recapCard');
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - (recapPeriod==='week' ? 6 : 29));
  const startStr = start.toISOString().slice(0,10);
  const beforeStart = new Date(start); beforeStart.setDate(beforeStart.getDate()-1);
  const beforeStartStr = beforeStart.toISOString().slice(0,10);

  const xpGained = state.profile.totalXP - xpTotalAtOrBefore(beforeStartStr);

  const missionsDone = state.missions.reduce((a,m)=> a + (m.completedDates||[]).filter(d=>d>=startStr).length, 0);

  const booksFinished = state.books.filter(b=> b.status==='Selesai' && b.finishDate && b.finishDate>=startStr).length;

  const tradesInPeriod = state.trades.filter(t=> t.date>=startStr);
  const netPips = tradesInPeriod.reduce((a,t)=> a + (parseFloat(t.pipsProfit)||0)-(parseFloat(t.pipsLoss)||0), 0);

  const readMinutes = state.readingSessions.filter(s=>s.date>=startStr).reduce((a,s)=>a+(s.minutes||0),0);
  const readPages = state.readingSessions.filter(s=>s.date>=startStr).reduce((a,s)=>a+(s.pages||0),0);

  const logsFilled = state.dailyLogs.filter(l=>l.date>=startStr).length;
  const goalsAchieved = state.targetGoals.filter(g=> g.done && g.doneDate && g.doneDate>=startStr).length;

  const items = [
    {label:'XP Diperoleh', val: xpGained>=0?`+${xpGained}`:xpGained},
    {label:'Mission Selesai', val: missionsDone},
    {label:'Buku Selesai', val: booksFinished},
    {label:'Trading (pips)', val: `${netPips>=0?'+':''}${netPips.toFixed(1)}`},
    {label:'Jumlah Trade', val: tradesInPeriod.length},
    {label:'Menit Membaca', val: readMinutes},
    {label:'Halaman Dibaca', val: readPages},
    {label:'Evaluasi Harian Terisi', val: `${logsFilled}/${recapPeriod==='week'?7:30}`},
    {label:'Tujuan Tercapai', val: goalsAchieved},
  ];
  grid.innerHTML = items.map(i=>`
    <div class="card stat-card"><div class="stat-value">${i.val}</div><div class="stat-label">${i.label}</div></div>
  `).join('');
}
