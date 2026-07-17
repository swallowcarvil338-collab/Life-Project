/* ---------- 26. READING TRACKER (Bookmory-inspired) ---------- */
function dayKey(d){ return d.toISOString().slice(0,10); }

function minutesOnDate(dateStr){
  return state.readingSessions.filter(s=>s.date===dateStr).reduce((a,s)=>a+(s.minutes||0),0);
}
function pagesOnDate(dateStr){
  return state.readingSessions.filter(s=>s.date===dateStr).reduce((a,s)=>a+(s.pages||0),0);
}
function fmtDuration(mins){
  if(mins<60) return `${mins} menit`;
  const h = Math.floor(mins/60), m = mins%60;
  return m>0 ? `${h} jam ${m} menit` : `${h} jam`;
}

function readingStreak(){
  let streak = 0;
  let cursor = new Date();
  // if no session logged today yet, start checking from yesterday
  if(minutesOnDate(dayKey(cursor))===0) cursor.setDate(cursor.getDate()-1);
  while(minutesOnDate(dayKey(cursor))>0){
    streak++;
    cursor.setDate(cursor.getDate()-1);
  }
  return streak;
}

function formatElapsed(ms){
  const totalSec = Math.max(0,Math.floor(ms/1000));
  const h = String(Math.floor(totalSec/3600)).padStart(2,'0');
  const m = String(Math.floor((totalSec%3600)/60)).padStart(2,'0');
  const s = String(totalSec%60).padStart(2,'0');
  return `${h}:${m}:${s}`;
}

function renderReadingTracker(){
  const card = document.getElementById('readingTrackerCard');
  const streak = readingStreak();
  const active = state.activeReadingSession;
  const ongoingBooks = state.books.filter(b=>b.status!=='Selesai');
  const todayMins = minutesOnDate(dayKey(new Date()));
  const todayPages = pagesOnDate(dayKey(new Date()));

  const timerSection = active ? `
    <div class="timer-display" id="timerDisplay">${formatElapsed(Date.now()-active.startTime)}</div>
    <button class="btn btn-danger btn-sm" onclick="stopReadingSession()">⏹ Selesai Sesi</button>
  ` : `
    <select id="readingBookSelect" style="max-width:220px;">
      <option value="">Umum (tanpa buku spesifik)</option>
      ${ongoingBooks.map(b=>`<option value="${b.id}">${escapeHtml(b.title)}</option>`).join('')}
    </select>
    <button class="btn btn-primary btn-sm" onclick="startReadingSession()">▶ Mulai Sesi Membaca</button>
  `;

  card.innerHTML = `
    <div class="reading-top">
      <div class="streak-box">
        <div class="streak-num">🔥${streak}</div>
        <div class="streak-label">Hari Beruntun<br>Membaca</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;align-items:flex-end;">${timerSection}</div>
    </div>
    <div class="muted" style="font-size:13px;margin-bottom:16px;">Hari ini: <b style="color:var(--text);">${fmtDuration(todayMins)}</b> · <b style="color:var(--text);">${todayPages} halaman</b></div>
    <div class="heatmap-grid" id="heatmapGrid"></div>
    <div class="heatmap-legend">
      <span>Sedikit</span>
      <div class="heat-cell" style="width:12px;height:12px;"></div>
      <div class="heat-cell lvl1" style="width:12px;height:12px;"></div>
      <div class="heat-cell lvl2" style="width:12px;height:12px;"></div>
      <div class="heat-cell lvl3" style="width:12px;height:12px;"></div>
      <span>Banyak</span>
    </div>
  `;

  const grid = document.getElementById('heatmapGrid');
  const cells = [];
  for(let i=27;i>=0;i--){
    const d = new Date(); d.setDate(d.getDate()-i);
    const key = dayKey(d);
    const mins = minutesOnDate(key);
    const pages = pagesOnDate(key);
    let lvl = '';
    if(mins>=60) lvl = 'lvl3'; else if(mins>=30) lvl = 'lvl2'; else if(mins>0) lvl = 'lvl1';
    cells.push(`<div class="heat-cell ${lvl}" title="${key}: ${mins} menit, ${pages} halaman"></div>`);
  }
  grid.innerHTML = cells.join('');
}

/* update the running timer text every second without a full re-render */
setInterval(()=>{
  const el = document.getElementById('timerDisplay');
  if(el && state.activeReadingSession){
    el.textContent = formatElapsed(Date.now()-state.activeReadingSession.startTime);
  }
}, 1000);

function startReadingSession(){
  const bookId = document.getElementById('readingBookSelect').value || null;
  state.activeReadingSession = {startTime: Date.now(), bookId};
  saveAndRenderAll();
}

function stopReadingSession(){
  const active = state.activeReadingSession;
  if(!active) return;
  openModal(`
    <div class="modal-head"><h3>Selesai Sesi Membaca</h3><button class="modal-close" onclick="closeModal()">×</button></div>
    <p class="muted" style="margin-bottom:16px;">Durasi sesi: <b id="sessionDurationTxt">${formatElapsed(Date.now()-active.startTime)}</b></p>
    <div class="field"><label>Halaman dibaca (opsional)</label><input id="f_sessionpages" type="number" min="0" value="0"></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="confirmStopSession()">Simpan Sesi</button>
    </div>
  `);
}

function confirmStopSession(){
  const active = state.activeReadingSession;
  if(!active) return;
  const minutes = Math.max(1, Math.round((Date.now()-active.startTime)/60000));
  const pages = parseInt(document.getElementById('f_sessionpages').value)||0;
  state.readingSessions.push({id:uid(), date:dayKey(new Date()), bookId:active.bookId, minutes, pages});
  state.stats.readingHours += Math.round((minutes/60)*10)/10;
  state.activeReadingSession = null;
  addXP(Math.min(30, Math.max(5, Math.round(minutes/5))));
  addSkillXP('reading', Math.min(25, Math.max(5, Math.round(minutes/4))));
  closeModal();
  saveAndRenderAll();
}
