/* ---------- 31. LEARNING TIMER ---------- */
function renderLearningTimer(){
  const card = document.getElementById('learningTimerCard');
  const active = state.activeLearningSession;
  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
      <div class="card-title" style="font-size:15px;margin-bottom:0;">⏱️ Learning Timer</div>
      ${active ? `
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="timer-display" id="learningTimerDisplay" style="font-size:20px;">${formatElapsed(Date.now()-active.startTime)}</div>
          <button class="btn btn-danger btn-sm" onclick="stopLearningSession()">⏹ Selesai</button>
        </div>
      ` : `<button class="btn btn-primary btn-sm" onclick="startLearningSession()">▶ Mulai Belajar</button>`}
    </div>
  `;
}
setInterval(()=>{
  const el = document.getElementById('learningTimerDisplay');
  if(el && state.activeLearningSession){
    el.textContent = formatElapsed(Date.now()-state.activeLearningSession.startTime);
  }
}, 1000);

function startLearningSession(){
  state.activeLearningSession = {startTime: Date.now()};
  saveAndRenderAll();
}
function stopLearningSession(){
  const active = state.activeLearningSession;
  if(!active) return;
  const minutes = Math.max(1, Math.round((Date.now()-active.startTime)/60000));
  state.stats.learningHours += Math.round((minutes/60)*10)/10;
  state.activeLearningSession = null;
  addXP(Math.min(30, Math.max(5, Math.round(minutes/5))));
  addSkillXP('learning', Math.min(25, Math.max(5, Math.round(minutes/4))));
  showToast(`Sesi belajar ${minutes} menit tersimpan`,'');
  saveAndRenderAll();
}
