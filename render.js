/* ---------- 4. TOAST ---------- */
function showToast(msg, type=''){
  const wrap = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className = 'toast '+type;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity .3s'; setTimeout(()=>el.remove(),300); }, 3200);
}

/* ---------- 5. RENDER: CHARACTER PROFILE ---------- */
function renderProfile(){
  const p = state.profile;
  const avatarEl = document.getElementById('avatarEl');
  avatarEl.innerHTML = p.avatarPhoto ? `<img src="${p.avatarPhoto}" alt="Foto profil">` : escapeHtml(p.avatarLetter || p.name.charAt(0).toUpperCase());
  document.getElementById('charName').textContent = p.name;
  document.getElementById('charTitleTxt').textContent = '"'+p.title+'"';
  document.getElementById('charMotto').textContent = '"'+p.motto+'"';
  const rank = rankForLevel(p.level);
  document.getElementById('charRank').textContent = rank.toUpperCase();
  document.getElementById('levelNum').textContent = p.level;
  const req = xpRequired(p.level);
  document.getElementById('xpText').textContent = `${p.xp} / ${req} XP`;
  document.getElementById('xpBar').style.width = Math.min(100,(p.xp/req)*100)+'%';
  document.getElementById('totalXPVal').textContent = p.totalXP;
  document.getElementById('legacyVal').textContent = Object.keys(state.achievements).length;
  document.getElementById('powerVal').textContent = Math.round(p.totalXP/10 + p.level*5);
  document.getElementById('joinDateVal').textContent = p.joinDate;

  const activeMission = state.missions.find(m=>m.id===p.currentMissionId && !isMissionDoneToday(m)) || state.missions.find(m=>!isMissionDoneToday(m));
  document.getElementById('currentMissionTxt').textContent = activeMission ? activeMission.title : 'Belum ada misi aktif. Tambahkan quest pertamamu di bawah.';

  renderSkillBars();
  renderRankTrack();
}

function renderSkillBars(){
  const wrap = document.getElementById('skillBars');
  wrap.innerHTML = SKILL_LIST.map(key=>{
    const sk = state.skills[key];
    const req = xpRequired(sk.level);
    const pct = Math.min(100,(sk.xp/req)*100);
    return `<div class="skill-row">
      <div class="skill-row-top"><span class="sname">${SKILL_LABEL[key]}</span><span class="slvl">Lv.${sk.level}</span></div>
      <div class="skill-bar-outer"><div class="skill-bar-inner" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
}

function renderRankTrack(){
  const curIdx = RANKS.indexOf(rankForLevel(state.profile.level));
  document.getElementById('rankTrack').innerHTML = RANKS.map((r,i)=>{
    let cls = '';
    if(i < curIdx) cls = 'done';
    if(i === curIdx) cls = 'active';
    return `<div class="rank-pill ${cls}">${r}</div>`;
  }).join('');
}

/* ---------- 6. RENDER: MISSIONS ---------- */
let activeMissionFilter = 'Semua';

function missionStreak(){
  const dateSet = new Set();
  state.missions.forEach(m=> (m.completedDates||[]).forEach(d=> dateSet.add(d)));
  let streak = 0;
  let cursor = new Date();
  if(!dateSet.has(todayStr())) cursor.setDate(cursor.getDate()-1);
  while(dateSet.has(cursor.toISOString().slice(0,10))){
    streak++;
    cursor.setDate(cursor.getDate()-1);
  }
  return streak;
}
function renderMissionStreak(){
  const el = document.getElementById('missionStreakDisplay');
  if(el) el.innerHTML = `🔥 <b>${missionStreak()}</b> hari beruntun`;
}

function renderMissionFilters(){
  const cats = ['Semua', ...MISSION_CATEGORIES];
  document.getElementById('missionFilters').innerHTML = cats.map(c=>
    `<button class="chip ${c===activeMissionFilter?'active':''}" onclick="setMissionFilter('${c}')">${c}</button>`
  ).join('');
}
function setMissionFilter(c){ activeMissionFilter = c; renderMissions(); renderMissionFilters(); }

function renderMissions(){
  const list = document.getElementById('missionList');
  let missions = [...state.missions].sort((a,b)=> (isMissionDoneToday(a) - isMissionDoneToday(b)) || (a.deadline||'').localeCompare(b.deadline||''));
  if(activeMissionFilter !== 'Semua') missions = missions.filter(m=>m.category===activeMissionFilter);

  if(missions.length===0){
    list.innerHTML = `<div class="empty-state"><div class="big">🗺️</div><div>Belum ada mission di kategori ini. Mission bersifat harian — sekali dibuat, akan reset otomatis tiap hari.</div></div>`;
    return;
  }
  list.innerHTML = missions.map(m=>{
    const done = isMissionDoneToday(m);
    return `
    <div class="mission-item ${done?'done':''}">
      <div class="check-circle" onclick="toggleMission('${m.id}')">${done?'✓':''}</div>
      <div class="mission-body">
        <div class="mission-title">${escapeHtml(m.title)}</div>
        <div class="mission-meta">
          <span class="badge">${m.category}</span>
          ${m.deadline?`<span class="badge">📅 ${m.deadline}</span>`:''}
          <span class="badge badge-xp">+${m.xpReward} XP</span>
        </div>
      </div>
      <div class="mission-actions">
        <button class="btn-icon" onclick="openMissionModal('${m.id}')" title="Edit">✎</button>
        <button class="btn-icon" onclick="deleteMission('${m.id}')" title="Hapus">🗑</button>
      </div>
    </div>
  `;}).join('');
}

function toggleMission(id){
  const m = state.missions.find(x=>x.id===id);
  if(!m) return;
  if(!m.completedDates) m.completedDates = [];
  const today = todayStr();
  const idx = m.completedDates.indexOf(today);
  if(idx===-1){
    m.completedDates.push(today);
    addXP(m.xpReward);
    addSkillXP(CATEGORY_SKILL_MAP[m.category], Math.round(m.xpReward*0.6));
    state.stats.missionCompletions += 1;
  } else {
    m.completedDates.splice(idx,1);
    state.profile.totalXP = Math.max(0,state.profile.totalXP - m.xpReward);
    state.stats.missionCompletions = Math.max(0, state.stats.missionCompletions - 1);
  }
  saveAndRenderAll();
}

function deleteMission(id){
  if(!confirm('Hapus mission ini? Mission harian akan hilang permanen, bukan cuma untuk hari ini.')) return;
  state.missions = state.missions.filter(m=>m.id!==id);
  saveAndRenderAll();
}

function escapeHtml(str){
  const d = document.createElement('div'); d.textContent = str??''; return d.innerHTML;
}

/* ---------- 7. RENDER: TARGETS ---------- */
