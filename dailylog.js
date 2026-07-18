/* ---------- 28. DAILY EVALUATION & GRATITUDE JOURNAL ---------- */
const MOOD_EMOJIS = ['😞','😐','🙂','😄','🤩'];
let selectedMood = 3;

function getTodayLog(){
  return state.dailyLogs.find(l=>l.date===todayStr()) || null;
}

function renderDailyLogForm(){
  const today = getTodayLog();
  selectedMood = today ? today.mood : 3;
  const g = today ? today.gratitude : ['','',''];
  const form = document.getElementById('dailyLogForm');
  form.innerHTML = `
    <div class="card-title" style="font-size:16px;">Bagaimana harimu, ${escapeHtml(state.profile.name)}?</div>
    <div class="mood-row" id="moodRow">
      ${MOOD_EMOJIS.map((e,i)=>`<button type="button" class="mood-btn ${i+1===selectedMood?'active':''}" onclick="pickMood(${i+1})">${e}</button>`).join('')}
    </div>
    <div class="field"><label>Evaluasi Hari Ini (apa yang berjalan baik, apa yang perlu diperbaiki)</label>
      <textarea id="f_evaltext" style="min-height:90px;">${today?escapeHtml(today.evaluation||''):''}</textarea>
    </div>
    <label>Jurnal Syukur (3 hal yang kamu syukuri hari ini)</label>
    <div class="gratitude-input-row"><span>🙏</span><input id="f_grat1" value="${escapeHtml(g[0]||'')}" placeholder="Hal pertama..."></div>
    <div class="gratitude-input-row"><span>🙏</span><input id="f_grat2" value="${escapeHtml(g[1]||'')}" placeholder="Hal kedua..."></div>
    <div class="gratitude-input-row"><span>🙏</span><input id="f_grat3" value="${escapeHtml(g[2]||'')}" placeholder="Hal ketiga..."></div>
    <button class="btn btn-primary btn-sm" style="margin-top:10px;" onclick="saveDailyLog()">${today?'Update':'Simpan'} Evaluasi Hari Ini</button>
  `;
}
function pickMood(n){
  selectedMood = n;
  document.querySelectorAll('#moodRow .mood-btn').forEach((el,i)=> el.classList.toggle('active', i+1===n));
}
function saveDailyLog(){
  const evaluation = document.getElementById('f_evaltext').value.trim();
  const gratitude = [
    document.getElementById('f_grat1').value.trim(),
    document.getElementById('f_grat2').value.trim(),
    document.getElementById('f_grat3').value.trim()
  ].filter(x=>x);
  const existing = getTodayLog();
  if(existing){
    existing.mood = selectedMood; existing.evaluation = evaluation; existing.gratitude = gratitude;
  } else {
    state.dailyLogs.push({date:todayStr(), mood:selectedMood, evaluation, gratitude});
    addXP(15);
    addSkillXP('discipline',10);
  }
  saveAndRenderAll();
  showToast('Evaluasi harian tersimpan','');
}
function deleteDailyLog(date){
  if(!confirm('Hapus catatan hari ini?')) return;
  state.dailyLogs = state.dailyLogs.filter(l=>l.date!==date);
  saveAndRenderAll();
}
function renderDailyLogHistory(){
  const list = document.getElementById('dailyLogHistory');
  const sorted = [...state.dailyLogs].sort((a,b)=> b.date.localeCompare(a.date));
  if(sorted.length===0){
    list.innerHTML = `<div class="empty-state"><div class="big">🙏</div><div>Belum ada catatan evaluasi. Isi form di atas untuk memulai.</div></div>`;
    return;
  }
  list.innerHTML = sorted.map(l=>`
    <div class="card daylog-card">
      <div class="daylog-head">
        <div class="daylog-date">${l.date}</div>
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="daylog-mood">${MOOD_EMOJIS[(l.mood||3)-1]}</div>
          <button class="btn-icon" onclick="deleteDailyLog('${l.date}')">🗑</button>
        </div>
      </div>
      ${l.evaluation?`<div style="font-size:13px;color:var(--text2);">${escapeHtml(l.evaluation)}</div>`:''}
      ${l.gratitude&&l.gratitude.length?`<ul class="daylog-gratitude-list">${l.gratitude.map(g=>`<li>${escapeHtml(g)}</li>`).join('')}</ul>`:''}
    </div>
  `).join('');
}
function renderDailyLog(){
  renderDailyLogForm();
  renderDailyLogHistory();
}
